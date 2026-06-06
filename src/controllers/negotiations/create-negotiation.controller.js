// controllers/negotiations/create-negotiation.controller.js

const { negotiationServices } = require("@services/negotiations");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendNegotiationCreatedSuccess } = require("@/responses/success/negotiation.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/negotiations
 * Create a new negotiation for a project.
 */
const createNegotiationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowParallelMeetings, workflowMode } = req.body;

    logWithTime(
      `📍 [createNegotiationController] Creating negotiation for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await negotiationServices.createNegotiationService({
      projectId,
      allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : false,
      workflowMode: typeof workflowMode === 'string' ? workflowMode : null,
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
          `❌ [createNegotiationController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "An active negotiation already exists for this project.");
      }
      logWithTime(`❌ [createNegotiationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createNegotiationController] Negotiation created successfully | ${getLogIdentifiers(req)}`);
    return sendNegotiationCreatedSuccess(res, result.negotiation);

  } catch (error) {
    logWithTime(`❌ [createNegotiationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createNegotiationController };
