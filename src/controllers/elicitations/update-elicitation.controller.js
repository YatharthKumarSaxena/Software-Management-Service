// controllers/elicitations/update-elicitation.controller.js

const { updateElicitationService } = require("@services/elicitations/update-elicitation.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Update Elicitation
 *
 * @route  PATCH /software-management-service/api/v1/admin/projects/:projectId/elicitations/:elicitationId
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * @param elicitationId - Elicitation ID from URL params
 * @body {string} [title] - Elicitation title (optional)
 * @body {string} [description] - Elicitation description (optional)
 * @body {Object} [updateData] - Additional fields to update
 *
 * @description Updates elicitation fields.
 *
 * @returns {200} Elicitation updated successfully
 * @returns {400} Invalid data provided
 * @returns {403} User is not a stakeholder of the project
 * @returns {404} Elicitation not found
 * @returns {500} Internal server error
 */
const updateElicitationController = async (req, res) => {
  try {
    const elicitationId = req.elicitation._id;
    const projectId = req.project._id;
    const updatedBy = req.admin.adminId;
    const updateData = req.body;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await updateElicitationService({
      elicitationId,
      projectId,
      updateData,
      updatedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      logWithTime(`❌ [updateElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [updateElicitationController] Elicitation updated successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "Elicitation updated successfully",
      data: result.data,
    });

  } catch (error) {
    logWithTime(`❌ [updateElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateElicitationController };
