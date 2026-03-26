// controllers/fast/create-fast.controller.js

const { createFastService } = require("@services/fast/create-fast.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Create FAST Meeting
 *
 * @route  POST /software-management-service/api/v1/admin/projects/:projectId/fast
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * @body {string} title - FAST meeting title
 * @body {string} description - FAST meeting description
 * @body {ISO8601} startedAt - Meeting start time (must be >= current time)
 *
 * @description Creates and schedules a FAST (Focused Analysis and Specification Technique) meeting.
 *
 * @returns {201} FAST meeting created successfully
 * @returns {400} Missing required fields or invalid data
 * @returns {403} User is not a stakeholder of the project
 * @returns {500} Internal server error
 */
const createFastController = async (req, res) => {
  try {
    const projectId = req.project._id;
    const createdBy = req.admin.adminId;
    const { title, description, startedAt } = req.body;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await createFastService({
      projectId,
      title,
      description,
      startedAt,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      logWithTime(`❌ [createFastController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [createFastController] FAST meeting created successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "FAST meeting created successfully",
      data: result.data,
    });

  } catch (error) {
    logWithTime(`❌ [createFastController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createFastController };
