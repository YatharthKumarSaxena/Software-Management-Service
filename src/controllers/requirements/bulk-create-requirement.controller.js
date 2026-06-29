// controllers/requirements/bulk-create-requirement.controller.js
//
// Handles POST /projects/:projectId/requirements/bulk
//
// By the time this controller runs, the middleware chain has already:
//   1. Authenticated the user                  (baseAuthClientOrAdminMiddlewares)
//   2. Fetched + validated the project         (fetchProjectMiddleware)
//   3. Confirmed the user is a stakeholder     (checkUserIsStakeholder)
//   4. Confirmed the project is active         (activeProjectGuardMiddleware)
//   5. Confirmed an open Elicitation exists    (fetchLatestOpenElicitationMiddleware)
//   6. Validated files (type, size, count)     (checkRequirementFileUploadConfiguration)
//      → req.files[] set by multer
//   7. Parsed every file into importData       (parseSpreadsheetFileMiddleware)
//      → req.importData = [ { headers, rows, sheetName }, ... ]
//   8. Validated required headers              (createRequirementInBulkHeaderValidationMiddleware)
//
// Controller merges req.files + req.importData into a single `files` array
// and hands it to bulkCreateRequirementService.

const { bulkCreateRequirementService } = require("@services/requirements/bulk-create-requirement.service");
const {
  throwInternalServerError,
  throwBadRequestError,
  getLogIdentifiers,
} = require("@responses/common/error-handler.response");
const { sendBulkRequirementImportSuccess } = require("@responses/success/bulk-import.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * POST /projects/:projectId/requirements/bulk
 *
 * Processes one or more uploaded spreadsheet files as a bulk requirement import
 * within the active Elicitation phase of the project.
 */
const bulkCreateRequirementController = async (req, res) => {
  try {
    const { project, elicitation } = req;

    logWithTime(
      `📍 [bulkCreateRequirementController] Starting bulk import for project: ${project?._id} | ${getLogIdentifiers(req)}`
    );

    // ── Resolve caller identity ─────────────────────────────────────────────
    const user      = req.admin || req.client;
    const createdBy = user?.adminId || user?.clientId;

    // ── Merge multer files with their parsed importData ─────────────────────
    //
    // req.files    = [ { path, originalname, ... }, ... ]  (from multer)
    // req.importData = [ { headers, rows, sheetName }, ... ] (from parseSpreadsheetFileMiddleware)
    //
    // Both arrays are in the same order (one-to-one correspondence).

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const importDataArr = Array.isArray(req.importData)
      ? req.importData
      : [req.importData];

    if (uploadedFiles.length === 0) {
      return throwBadRequestError(res, "No files uploaded.");
    }

    if (uploadedFiles.length !== importDataArr.length) {
      logWithTime(
        `⚠️ [bulkCreateRequirementController] File count mismatch: ` +
        `${uploadedFiles.length} uploaded vs ${importDataArr.length} parsed`
      );
      return throwBadRequestError(res, "File parsing mismatch. Please re-upload.");
    }

    const files = uploadedFiles.map((file, idx) => ({
      filePath:     file.path,
      originalname: file.originalname,
      importData:   importDataArr[idx],
    }));

    // ── Parse boolean body params ────────────────────────────────────────────
    //
    // If the client sends a valid bool/"true"/"false" → honour it.
    // If the param is absent / undefined / any other value → null.
    // null means "not provided" — createBulkImportService will fall back
    // to its own env-variable defaults (BULK_IMPORT_UPLOAD_ORIGINAL etc.).
    //
    const parseBoolParam = (value) => {
      if (value === true  || value === "true")  return true;
      if (value === false || value === "false") return false;
      return null;
    };

    const preserveSourceFile    = parseBoolParam(req.body?.preserveSourceFile);
    const preserveProcessedFile = parseBoolParam(req.body?.preserveProcessedFile);

    // ── Call service ────────────────────────────────────────────────────────
    const result = await bulkCreateRequirementService({
      project,
      elicitation,
      files,
      createdBy,
      preserveSourceFile,
      preserveProcessedFile,
      auditContext: {
        user,
        device:    req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      logWithTime(
        `❌ [bulkCreateRequirementController] Service failed | ${getLogIdentifiers(req)}`
      );
      return throwBadRequestError(res, result.message || "Bulk import failed.");
    }

    // ── Success ─────────────────────────────────────────────────────────────
    logWithTime(
      `✅ [bulkCreateRequirementController] Import complete. ` +
      `Success: ${result.summary.successfulRows}, ` +
      `Failed: ${result.summary.failedRows}, ` +
      `Skipped: ${result.summary.skippedRows} | ${getLogIdentifiers(req)}`
    );

    return sendBulkRequirementImportSuccess(res, result);

  } catch (error) {
    logWithTime(
      `❌ [bulkCreateRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { bulkCreateRequirementController };
