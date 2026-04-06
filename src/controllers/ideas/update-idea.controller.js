// controllers/ideas/update-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwConflictError,
  throwAccessDeniedError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaUpdatedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, UNAUTHORIZED } = require("@configs/http-status.config");

/**
 * PATCH /ideas/:ideaId
 * Update an idea's title and/or description.
 */
const updateIdeaController = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { idea } = req;

    logWithTime(
      `📍 [updateIdeaController] Updating idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await ideaServices.updateIdeaService(
      idea,
      {
        title,
        description,
        updatedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [updateIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      if (result.errorCode === UNAUTHORIZED) {
        return throwAccessDeniedError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message);
      }
      
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [updateIdeaController] Idea updated successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaUpdatedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [updateIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateIdeaController };
