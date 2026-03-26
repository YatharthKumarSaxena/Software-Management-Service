// controllers/fast/delete-fast.controller.js

const { deleteFastService } = require("@services/fast/delete-fast.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Delete FAST Meeting (Cancel Meeting)
 *
 * @route  DELETE /software-management-service/api/v1/admin/projects/:projectId/fast/:fastId
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * @param fastId - FAST meeting ID from URL params
 *
 * @description Cancels a FAST meeting by clearing its details (sets title, description, startedAt to null).
 * This effectively "cancels" the meeting while keeping the record.
 *
 * @returns {200} FAST meeting cancelled successfully
 * @returns {403} User is not a stakeholder of the project
 * @returns {404} FAST meeting not found
 * @returns {500} Internal server error
 */
const deleteFastController = async (req, res) => {
  try {
    const fastId = req.fast._id;
    const projectId = req.project._id;
    const cancelledBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await deleteFastService({
      fastId,
      projectId,
      cancelledBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      logWithTime(`❌ [deleteFastController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [deleteFastController] FAST meeting cancelled successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "FAST meeting cancelled successfully",
      data: result.data,
    });

  } catch (error) {
    logWithTime(`❌ [deleteFastController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteFastController };
