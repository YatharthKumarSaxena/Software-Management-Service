
const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");
const { createListService } = require("@services/factory/create-list-service.factory");

const myActivityListService = createListService({
  model: ActivityTrackerModel,
  hiddenFields: ["__v", "adminActions", "userData", "deviceInfo", "reqBody", "isDeleted", "deletedAt", "deletedBy", "updatedAt", "updatedBy"],
  searchableFields: [],
  sortableFields: ["createdAt"],
  filterableFields: ["userId"]
});

/**
 * Get current user's activity history with limited fields
 * Shows only recent activities with basic information
 * Accessible by both admin and client
 * 
 * @param {string} userId - User ID (admin or client)
 * @param {Object} filters - Extracted from parseListFilters
 */
const getMyActivityService = async (userId, filters = {}) => {
  try {
    const andConditions = [{ field: "userId", operator: "eq", value: userId }];

    if (filters.query) {
      andConditions.push(filters.query);
    }

    const query = { and: andConditions };

    const result = await myActivityListService({
      query,
      selectFields: ["description", "eventType", "createdAt", "_id"],
      pageNumber: filters.pageNumber,
      pageSize: Math.min(50, filters.pageSize || 20),
      sortField: filters.sortField || "createdAt",
      sortOrder: filters.sortOrder || "desc"
    });

    return {
      success: true,
      activities: result.data.map(activity => ({
        id: activity._id, 
        description: activity.description,
        eventType: activity.eventType,
        timestamp: activity.createdAt
      })),
      pagination: result.pagination
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