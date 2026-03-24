// controllers/activity-trackers/list-activity.controller.js

const { listActivityService } = require("@services/activity-trackers/list-activity.service");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Controller: List Activities
 * Admin only - Lists all activities with full details
 * Supports filtering by userId, eventType, date range
 * Shows complete activity information for audit purposes
 */
const listActivityController = async (req, res) => {
  try {
    const { userId, eventType, dateFrom, dateTo, page, limit } = req.query;

    // Build filters object
    const filters = {};
    if (userId) filters.userId = userId;
    if (eventType) filters.eventType = eventType;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    // ── Call service ──────────────────────────────────────
    const result = await listActivityService(filters, { page, limit });

    if (!result.success) {
      logWithTime(`❌ [listActivityController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listActivityController] Activities listed successfully | ${getLogIdentifiers(req)}`);
    
    return res.status(200).json({
      success: true,
      data: {
        activities: result.activities,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: parseInt(limit, 10) || 20
        },
        filters: {
          userId: userId || null,
          eventType: eventType || null,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null
        }
      }
    });

  } catch (error) {
    logWithTime(`❌ [listActivityController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listActivityController };
