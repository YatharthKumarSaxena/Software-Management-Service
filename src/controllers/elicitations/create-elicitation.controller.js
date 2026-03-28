// controllers/elicitations/create-elicitation.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendElicitationCreatedSuccess } = require("@/responses/success/elicitation.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations
 * Create a new elicitation for a project.
 */
const createElicitationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { elicitationMode, allowParallelMeetings } = req.body;

    logWithTime(
      `📍 [createElicitationController] Creating elicitation for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await elicitationServices.createElicitationService({
      projectId,
      mode: elicitationMode,
      allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : false,
      createdBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [createElicitationController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "An active elicitation already exists for this project.");
      }
      logWithTime(`❌ [createElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createElicitationController] Elicitation created successfully | ${getLogIdentifiers(req)}`);
    return sendElicitationCreatedSuccess(res, result.elicitation);

  } catch (error) {
    logWithTime(`❌ [createElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createElicitationController };
