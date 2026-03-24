const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");

/**
 * List all activities with full details (Admin only)
 * Shows complete activity tracker information
 * Accessible by admin only with full access control
 * 
 * @param {Object} filters - { userId, eventType, dateFrom, dateTo }
 * @param {Object} pagination - { page, limit }
 * @returns {{ success: boolean, activities?: Array, total?: number, page?: number, totalPages?: number, message?: string, error?: string }}
 */
const listActivityService = async (filters = {}, pagination = {}) => {
  try {
    const page = Math.max(1, parseInt(pagination.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 20));
    const skip = (page - 1) * limit;

    // Build query filter
    const query = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.eventType) {
      query.eventType = filters.eventType;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Fetch all activities with full details
    const [activities, total] = await Promise.all([
      ActivityTrackerModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityTrackerModel.countDocuments(query)
    ]);

    return {
      success: true,
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logWithTime(`❌ [listActivityService] Error listing activities`);
    errorMessage(error);
    return {
      success: false,
      message: "Internal error while listing activities",
      error: error.message
    };
  }
};

module.exports = {
  listActivityService
};