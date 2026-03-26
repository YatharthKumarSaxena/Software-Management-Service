// controllers/elicitations/create-elicitation.controller.js

const { createElicitationService } = require("@services/elicitations/create-elicitation.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Create Elicitation
 *
 * @route  POST /software-management-service/api/v1/admin/projects/:projectId/elicitations
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * 
 * @description Creates an empty elicitation record to start requirement engineering.
 * No title or description is provided initially.
 *
 * @returns {201} Elicitation created successfully
 * @returns {400} Invalid project or missing fields
 * @returns {403} User is not a stakeholder of the project
 * @returns {500} Internal server error
 */
const createElicitationController = async (req, res) => {
  try {
    const projectId = req.project._id;
    const createdBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await createElicitationService({
      projectId,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Validation error") {
        logWithTime(`❌ [createElicitationController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }

      logWithTime(`❌ [createElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [createElicitationController] Elicitation created successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "Elicitation created successfully",
      data: result.data,
    });

  } catch (error) {
    logWithTime(`❌ [createElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createElicitationController };
