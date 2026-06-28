// utils/bulk-import-temp.util.js
//
// Manages the temporary directory structure for bulk imports:
//   src/uploads/temp/bulk-imports/<bulkImportId>/
//     - processed.xlsx   (the running processed-report workbook)
//     - original.xlsx    (the original file, if preserveSourceFile=true)
//     - chunk-<n>.xlsx   (transient; deleted after processing)

const fs = require("fs");
const path = require("path");
const { logWithTime } = require("@utils/time-stamps.util");

const TEMP_BASE = path.join(
  __dirname,
  "..",
  "uploads",
  "temp",
  "bulk-imports"
);

/**
 * Returns the directory path for a specific bulk import session.
 */
const getBulkImportDir = (bulkImportId) =>
  path.join(TEMP_BASE, bulkImportId.toString());

/**
 * Returns the path to the processed report workbook.
 */
const getProcessedFilePath = (bulkImportId) =>
  path.join(getBulkImportDir(bulkImportId), "processed.xlsx");

/**
 * Returns the path where the original file is stored when preserveSourceFile=true.
 */
const getOriginalFilePath = (bulkImportId) =>
  path.join(getBulkImportDir(bulkImportId), "original.xlsx");

/**
 * Ensures the bulk-import session directory exists.
 */
const ensureBulkImportDir = (bulkImportId) => {
  const dir = getBulkImportDir(bulkImportId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

/**
 * Deletes the entire bulk-import session directory (called after finalization).
 */
const cleanupBulkImportDir = (bulkImportId) => {
  const dir = getBulkImportDir(bulkImportId);
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    logWithTime(
      `🗑️ [bulkImportTempUtil] Cleaned up temp dir for: ${bulkImportId}`
    );
  } catch (err) {
    logWithTime(
      `⚠️ [bulkImportTempUtil] Failed to clean up ${dir}: ${err.message}`
    );
  }
};

/**
 * Deletes a single chunk file after processing.
 */
const deleteChunkFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logWithTime(
      `⚠️ [bulkImportTempUtil] Failed to delete chunk ${filePath}: ${err.message}`
    );
  }
};

/**
 * Deletes any file if it exists.
 */
const deleteFileIfExists = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logWithTime(
      `⚠️ [bulkImportTempUtil] Failed to delete file ${filePath}: ${err.message}`
    );
  }
};

// utils/file.util.js

const cleanupUploadedFiles = ({ file, files }) => {

    if (file) {
        deleteFileIfExists(file.path);
    }

    if (Array.isArray(files)) {
        files.forEach(file =>
            deleteFileIfExists(file.path)
        );
    }

};

module.exports = {
  TEMP_BASE,
  getBulkImportDir,
  getProcessedFilePath,
  getOriginalFilePath,
  ensureBulkImportDir,
  cleanupBulkImportDir,
  deleteChunkFile,
  deleteFileIfExists,
  cleanupUploadedFiles
};
