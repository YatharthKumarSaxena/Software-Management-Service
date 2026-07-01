// controllers/ideas/update-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwConflictError,
  throwAccessDeniedError,
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendIdeaUpdatedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, UNAUTHORIZED, BAD_REQUEST, OK } = require("@configs/http-status.config");

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
        updatedBy: req?.admin?.adminId || req?.client?.clientId,
        auditContext: {
          user: req?.admin || req?.client,
          device: req?.device,
          requestId: req?.requestId
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
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Handle success with "No changes detected" message ──────────────
    if (result.message === "No changes detected") {
      logWithTime(`ℹ️ [updateIdeaController] No changes detected | ${getLogIdentifiers(req)}`);
      return res.status(OK).json({
        success: true,
        message: "No changes detected. Idea remains unchanged.",
        idea: result.idea
      });
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
