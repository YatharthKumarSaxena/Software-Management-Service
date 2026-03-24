// controllers/activity-trackers/get-activity.controller.js

const { getActivityByIdService } = require("@services/activity-trackers/get-activity-by-id.service");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  throwAccessDeniedError,
  throwDBResourceNotFoundError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Controller: Get Activity By ID
 * Admin only - Retrieve complete activity details if admin performed that action
 * Shows all fields: eventType, description, userData, deviceInfo, timestamp, adminActions, etc
 */
const getActivityController = async (req, res) => {
  try {
    const { activityId } = req.params;
    const adminId = req.admin.adminId;

    // ── Call service ──────────────────────────────────────
    const result = await getActivityByIdService(activityId, adminId);

    if (!result.success) {
      if (result.message === "Activity not found") {
        logWithTime(`❌ [getActivityController] Activity not found: ${activityId} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Activity");
      }

      if (result.isUnauthorized) {
        logWithTime(`❌ [getActivityController] Unauthorized access attempt | ${getLogIdentifiers(req)}`);
        return throwAccessDeniedError(res, result.message);
      }

      logWithTime(`❌ [getActivityController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getActivityController] Activity details fetched successfully | ${getLogIdentifiers(req)}`);
    
    return res.status(200).json({
      success: true,
      data: {
        activity: result.activity
      }
    });

  } catch (error) {
    logWithTime(`❌ [getActivityController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getActivityController };
