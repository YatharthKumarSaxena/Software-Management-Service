// controllers/elicitations/update-elicitation.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendElicitationUpdatedSuccess } = require("@/responses/success/elicitation.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK } = require("@configs/http-status.config");

/**
 * PUT /projects/:projectId/elicitations/:elicitationId
 * Update an elicitation's mode.
 */
const updateElicitationController = async (req, res) => {
  try {
    const { mode, allowParallelMeetings } = req.body;
    const { elicitation } = req;

    logWithTime(
      `📍 [updateElicitationController] Updating elicitation: ${elicitation._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await elicitationServices.updateElicitationService(
      elicitation,
      {
        mode,
        allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : undefined,
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
      logWithTime(`❌ [updateElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    if (result.message === "No changes detected") {
      return res.status(OK).json({
        success: true,
        message: "No changes detected. Elicitation mode remains unchanged."
      });
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [updateElicitationController] Elicitation updated successfully | ${getLogIdentifiers(req)}`);
    return sendElicitationUpdatedSuccess(res, result.elicitation);

  } catch (error) {
    logWithTime(`❌ [updateElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateElicitationController };
