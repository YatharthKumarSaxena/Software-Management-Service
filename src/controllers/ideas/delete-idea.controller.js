// controllers/ideas/delete-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwAccessDeniedError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaDeletedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { UNAUTHORIZED } = require("@configs/http-status.config");

/**
 * DELETE /ideas/:ideaId
 * Delete (soft delete) an idea.
 */
const deleteIdeaController = async (req, res) => {
  try {
    const { idea } = req;

    logWithTime(
      `📍 [deleteIdeaController] Deleting idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.deleteIdeaService(
      idea,
      {
        deletedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [deleteIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      if (result.errorCode === UNAUTHORIZED) {
        return throwAccessDeniedError(res, result.message);
      }
      
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [deleteIdeaController] Idea deleted successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaDeletedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [deleteIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteIdeaController };
