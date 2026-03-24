// controllers/activity-trackers/get-my-activity.controller.js

const { getMyActivityService } = require("@services/activity-trackers/get-my-activity.service");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Controller: Get My Activity
 * Allows both admin and client to view their own recent activity
 * Shows limited fields: description, eventType, timestamp
 */
const getMyActivityController = async (req, res) => {
  try {
    const userId = req.admin?.adminId || req.client?.clientId;
    const { page, limit } = req.query;

    // ── Call service ──────────────────────────────────────
    const result = await getMyActivityService(userId, { page, limit });

    if (!result.success) {
      logWithTime(`❌ [getMyActivityController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getMyActivityController] Activities fetched successfully | ${getLogIdentifiers(req)}`);
    
    return res.status(200).json({
      success: true,
      data: {
        activities: result.activities,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: parseInt(limit, 10) || 20
        }
      }
    });

  } catch (error) {
    logWithTime(`❌ [getMyActivityController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getMyActivityController };
