// controllers/specifications/create-specification.controller.js

const { specificationServices } = require("@services/specifications");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendSpecificationCreatedSuccess } = require("@/responses/success/specification.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/specifications
 * Create a new specification for a project.
 */
const createSpecificationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;

    logWithTime(
      `📍 [createSpecificationController] Creating specification for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await specificationServices.createSpecificationService({
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
          `❌ [createSpecificationController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "An active specification already exists for this project.");
      }
      logWithTime(`❌ [createSpecificationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createSpecificationController] Specification created successfully | ${getLogIdentifiers(req)}`);
    return sendSpecificationCreatedSuccess(res, result.specification);

  } catch (error) {
    logWithTime(`❌ [createSpecificationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createSpecificationController };
