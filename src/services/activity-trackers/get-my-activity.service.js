
const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");

/**
 * Get current user's activity history with limited fields
 * Shows only recent activities with basic information
 * Accessible by both admin and client
 * 
 * @param {string} userId - User ID (admin or client)
 * @param {Object} pagination - { page, limit }
 * @returns {{ success: boolean, activities?: Array, total?: number, page?: number, totalPages?: number, message?: string, error?: string }}
 */
const getMyActivityService = async (userId, pagination = {}) => {
  try {
    const page = Math.max(1, parseInt(pagination.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(pagination.limit, 10) || 20));
    const skip = (page - 1) * limit;

    // Fetch user's activities with limited fields
    const [activities, total] = await Promise.all([
      ActivityTrackerModel.find({ userId })
        .select('description eventType createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityTrackerModel.countDocuments({ userId })
    ]);

    return {
      success: true,
      activities: activities.map(activity => ({
        description: activity.description,
        eventType: activity.eventType,
        timestamp: activity.createdAt
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logWithTime(`❌ [getMyActivityService] Error fetching user activities`);
    errorMessage(error);
    return {
      success: false,
      message: "Internal error while fetching activities",
      error: error.message
    };
  }
};

module.exports = {
  getMyActivityService
};