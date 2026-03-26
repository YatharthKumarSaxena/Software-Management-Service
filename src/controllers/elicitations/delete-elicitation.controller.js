// controllers/elicitations/delete-elicitation.controller.js

const { deleteElicitationService } = require("@services/elicitations/delete-elicitation.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Delete Elicitation
 *
 * @route  DELETE /software-management-service/api/v1/admin/projects/:projectId/elicitations/:elicitationId
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * @param elicitationId - Elicitation ID from URL params
 * @body {string} deletionReasonType - Reason for deletion (required)
 * @body {string} [deletionReasonDescription] - Description of deletion reason (required if project criticality = HIGH)
 *
 * @description Soft deletes an elicitation record.
 * If project criticality is HIGH, deletionReasonDescription is mandatory.
 *
 * @returns {200} Elicitation deleted successfully
 * @returns {400} Missing required fields or invalid data
 * @returns {403} User is not a stakeholder of the project
 * @returns {500} Internal server error
 */
const deleteElicitationController = async (req, res) => {
  try {
    const elicitationId = req.elicitation._id;
    const projectId = req.project._id;
    const projectCriticality = req.project.projectCriticality;
    const { deletionReasonType, deletionReasonDescription } = req.body;
    const deletedBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await deleteElicitationService({
      elicitationId,
      projectId,
      projectCriticality,
      deletionReasonType,
      deletionReasonDescription,
      deletedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      logWithTime(`❌ [deleteElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [deleteElicitationController] Elicitation deleted successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "Elicitation deleted successfully",
      data: result.data,
    });

  } catch (error) {
    logWithTime(`❌ [deleteElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteElicitationController };
