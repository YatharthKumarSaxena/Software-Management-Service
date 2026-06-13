// controllers/validations/create-validation.controller.js

const { validationServices } = require("@services/validations");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendValidationCreatedSuccess } = require("@/responses/success/validation.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/validations
 * Create a new validation for a project.
 */
const createValidationController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;

    logWithTime(
      `📍 [createValidationController] Creating validation for project: ${projectId} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await validationServices.createValidationService({
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
          `❌ [createValidationController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "An active validation already exists for this project.");
      }
      logWithTime(`❌ [createValidationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createValidationController] Validation created successfully | ${getLogIdentifiers(req)}`);
    return sendValidationCreatedSuccess(res, result.validation);

  } catch (error) {
    logWithTime(`❌ [createValidationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createValidationController };
