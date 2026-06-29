// services/storage/supabase-storage.service.js
//
// Supabase Storage implementation that replaces the previous Azure Blob Storage
// layer. External API remains unchanged so existing controllers/services do not
// require any modifications.
//
// Bucket Strategy
// ─────────────────────────────────────────────────────────────────────────────
// A single private bucket is used for all uploads. Folder hierarchy is simulated
// using object prefixes:
//
//   <projectId>/<bulkImportId>/original.xlsx
//   <projectId>/<bulkImportId>/processed.csv
//
// The bucket must already exist in Supabase.
//
// SRP Note
// ─────────────────────────────────────────────────────────────────────────────
// This service only knows HOW to upload. It does NOT decide WHAT to upload.
// All decisions (which files, env flags, preserve logic) live in the caller.
//

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const { logWithTime } = require("@utils/time-stamps.util");
const { getMyEnv, getMyEnvAsNumber } = require("@/utils/env.util");
const { BulkImportFileTypes } = require("@/configs/enums.config");

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────────────────────────────────────

let _supabaseClient = null;

const getSupabaseClient = () => {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  const supabaseUrl = getMyEnv("SUPABASE_URL");
  const supabaseKey = getMyEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  _supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  return _supabaseClient;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build Object Path
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the Supabase Storage object path for a given file.
 *
 * Example output: "proj-123/import-456/original.csv"
 *
 * @param {string} projectId
 * @param {string} bulkImportId
 * @param {string} type         - e.g. "original" | "processed"
 * @param {string} localPath    - used only to extract the file extension
 *
 * @returns {string}
 */
const buildObjectPath = (projectId, bulkImportId, type, localPath) => {
  const ext = path.extname(localPath);
  return `${projectId}/${bulkImportId}/${type}${ext}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload Single File
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a single file to Supabase Storage.
 *
 * If the file does not exist on disk, readFile() will reject and the error
 * will be caught here — no need for an existsSync() guard.
 *
 * @param {string} localFilePath
 * @param {string} objectPath
 *
 * @returns {Promise<{
 *   success: boolean,
 *   url?: string,
 *   error?: string
 * }>}
 */
const uploadFileToBlobService = async (localFilePath, objectPath) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      logWithTime(
        "⚠️ [supabaseStorageService] Supabase Storage is not configured."
      );

      return {
        success: false,
        error: "Supabase Storage not configured",
      };
    }

    const bucketName = getMyEnv(
      "SUPABASE_BUCKET_NAME",
      "bulk-import-files"
    );

    // readFile will throw if the file is missing — caught below.
    const fileBuffer = await fs.promises.readFile(localFilePath);

    const contentType =
      mime.lookup(localFilePath) || "application/octet-stream";

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(objectPath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      logWithTime(
        `❌ [supabaseStorageService] Upload failed for "${objectPath}": ${uploadError.message}`
      );

      return {
        success: false,
        error: uploadError.message,
      };
    }

    const signedUrlExpiry = getMyEnvAsNumber(
      "SUPABASE_SIGNED_URL_EXPIRY",
      604800
    );

    const { data: signedData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(objectPath, signedUrlExpiry);

    if (signedUrlError || !signedData?.signedUrl) {
      logWithTime(
        `⚠️ [supabaseStorageService] Upload succeeded but signed URL generation failed for "${objectPath}". ${signedUrlError?.message || ""}`
      );

      return {
        success: true,
        url: `supabase://${bucketName}/${objectPath}`,
      };
    }

    logWithTime(
      `✅ [supabaseStorageService] Uploaded "${objectPath}" successfully.`
    );

    return {
      success: true,
      url: signedData.signedUrl,
    };
  } catch (error) {
    logWithTime(
      `❌ [supabaseStorageService] Unexpected error: ${error.message}`
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload Bulk Import Files
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a pre-decided list of bulk import files to Supabase Storage.
 *
 * The caller is responsible for deciding WHICH files to include.
 * This service only loops and uploads — no business logic here.
 *
 * Folder Structure
 * ───────────────────────────────────────────
 *   <projectId>/<bulkImportId>/original.xlsx
 *   <projectId>/<bulkImportId>/processed.csv
 *
 * @param {Object}   options
 * @param {string}   options.projectId
 * @param {string}   options.bulkImportId
 * @param {Array<{
 *   type: string,   - "original" | "processed"
 *   path: string    - absolute local file path
 * }>} options.files - Pre-decided list of files to upload
 *
 * @returns {Promise<{
 *   originalFileUrl: string|null,
 *   processedFileUrl: string|null
 * }>}
 */
const MAX_CONCURRENT_UPLOADS = Math.max(
    1,
    getMyEnvAsNumber("BULK_IMPORT_MAX_CONCURRENT_UPLOADS", 3)
);

const uploadBulkImportFilesService = async ({
  projectId,
  bulkImportId,
  files = [],
}) => {
  const ALLOWED_TYPES = new Set(Object.values(BulkImportFileTypes));

  let originalFileUrl = null;
  let processedFileUrl = null;

  const uploadWorker = async (file) => {
    if (!ALLOWED_TYPES.has(file.type)) {
      logWithTime(
        `⚠️ [supabaseStorageService] Unsupported file type: ${file.type}`
      );
      return;
    }

    const objectPath = buildObjectPath(
      projectId,
      bulkImportId,
      file.type,
      file.path
    );

    const result = await uploadFileToBlobService(file.path, objectPath);

    if (!result.success) {
      logWithTime(
        `⚠️ [supabaseStorageService] Failed to upload ${file.type} file (${bulkImportId}): ${result.error}`
      );
      return;
    }

    if (file.type === BulkImportFileTypes.ORIGINAL) {
      originalFileUrl = result.url;
    } else if (file.type === BulkImportFileTypes.PROCESSED) {
      processedFileUrl = result.url;
    }
  };

  for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
    const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS);

    await Promise.all(
      batch.map((file) => uploadWorker(file))
    );
  }

  return {
    originalFileUrl,
    processedFileUrl,
  };
};

module.exports = {
  buildObjectPath,
  uploadFileToBlobService,
  uploadBulkImportFilesService,
};