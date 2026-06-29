// responses/success/bulk-import.response.js
//
// Success response senders for the Bulk Import module.

const { CREATED, OK } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

// ── BULK REQUIREMENT IMPORT ─────────────────────────────────────────────────

/**
 * Sends the overall summary response after all uploaded files have been
 * processed by bulkCreateRequirementService.
 *
 * @param {import("express").Response} res
 * @param {{
 *   summary: {
 *     totalFiles: number,
 *     totalRows: number,
 *     successfulRows: number,
 *     failedRows: number,
 *     skippedRows: number
 *   },
 *   files: Array<{
 *     filename: string,
 *     bulkImportId: string,
 *     stats: object,
 *     rowResults: Array<{ rowNumber, status, error }>
 *   }>
 * }} result
 */
const sendBulkRequirementImportSuccess = (res, result) => {
  const { summary, files } = result;

  logWithTime(
    `✅ [sendBulkRequirementImportSuccess] ` +
    `Files: ${summary.totalFiles}, ` +
    `Total Rows: ${summary.totalRows}, ` +
    `Success: ${summary.successfulRows}, ` +
    `Failed: ${summary.failedRows}, ` +
    `Skipped: ${summary.skippedRows}`
  );

  return res.status(CREATED).json({
    success: true,
    message: "Bulk requirement import completed.",
    data: {
      summary,
      files,
    },
  });
};

module.exports = {
  sendBulkRequirementImportSuccess,
};
