// controllers/elaborations/create-elaboration.controller.js

const { elaborationServices } = require("@services/elaborations");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendElaborationCreatedSuccess } = require("@/responses/success/elaboration.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elaborations
 * Create a new elaboration for a project.
 */
const createElaborationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;

    logWithTime(
      `📍 [createElaborationController] Creating elaboration for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await elaborationServices.createElaborationService({
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
          `❌ [createElaborationController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "An active elaboration already exists for this project.");
      }
      logWithTime(`❌ [createElaborationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createElaborationController] Elaboration created successfully | ${getLogIdentifiers(req)}`);
    return sendElaborationCreatedSuccess(res, result.elaboration);

  } catch (error) {
    logWithTime(`❌ [createElaborationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createElaborationController };
