// controllers/inceptions/create-inception.controller.js

const { inceptionServices } = require("@services/inceptions");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendInceptionCreatedSuccess } = require("@/responses/success/inception.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/inceptions
 * Create a new inception for a project.
 */
const createInceptionController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;

    logWithTime(
      `📍 [createInceptionController] Creating inception for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await inceptionServices.createInceptionService({
      projectId,
      allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : false,
      workflowMode: typeof workflowMode === 'string' ? workflowMode : null,
      phaseStatus: typeof phaseStatus === 'string' ? phaseStatus : null,
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
          `❌ [createInceptionController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "An active inception already exists for this project.");
      }
      logWithTime(`❌ [createInceptionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createInceptionController] Inception created successfully | ${getLogIdentifiers(req)}`);
    return sendInceptionCreatedSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [createInceptionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createInceptionController };
