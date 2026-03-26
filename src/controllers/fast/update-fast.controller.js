// controllers/fast/update-fast.controller.js

const { updateFastService } = require("@services/fast/update-fast.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Update FAST Meeting
 *
 * @route  PATCH /software-management-service/api/v1/admin/projects/:projectId/fast/:fastId
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * @param fastId - FAST meeting ID from URL params
 * @body {string} [title] - Meeting title
 * @body {string} [description] - Meeting description
 * @body {ISO8601} [startedAt] - Meeting start time (must be >= current time if provided)
 *
 * @description Updates FAST meeting details.
 *
 * @returns {200} FAST meeting updated successfully
 * @returns {400} Invalid data provided
 * @returns {403} User is not a stakeholder of the project
 * @returns {404} FAST meeting not found
 * @returns {500} Internal server error
 */
const updateFastController = async (req, res) => {
  try {
    const fastId = req.fast._id;
    const projectId = req.project._id;
    const updatedBy = req.admin.adminId;
    const { title, description, startedAt } = req.body;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await updateFastService({
      fastId,
      projectId,
      title,
      description,
      startedAt,
      updatedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      logWithTime(`❌ [updateFastController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [updateFastController] FAST meeting updated successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "FAST meeting updated successfully",
      data: result.data,
    });

  } catch (error) {
    logWithTime(`❌ [updateFastController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateFastController };
