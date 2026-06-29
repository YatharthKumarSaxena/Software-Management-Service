// services/activity-trackers/get-activity-by-id.service.js

const mongoose = require("mongoose");
const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");
const { createDocumentFilterService } = require("@services/factory/create-document-filter.service");
const { UserTypes } = require("@configs/enums.config");
const { ACTIVITY_TRACKER_ADMIN_LIST_FIELDS } = require("@/configs/list-fields.config");

const activityFilterService = createDocumentFilterService({
  hiddenFields: {
    [UserTypes.ADMIN]: ACTIVITY_TRACKER_ADMIN_LIST_FIELDS.hiddenFields,
  }
});

/**
 * Get activity tracker details by ID (Admin only)
 * Only returns full details if the requesting admin performed that action
 * 
 * @param {string} activityId - Activity tracker ID to fetch
 * @param {string} adminId - Admin ID requesting (must match userId in activity)
 * @param {Object} filters - Extracted from parseListFilters
 */
const getActivityByIdService = async (activityId, adminId, filters = {}) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return {
        success: false,
        message: "Invalid activity ID format"
      };
    }

    // Fetch activity from database
    const activity = await ActivityTrackerModel.findById(activityId).lean();

    if (!activity) {
      return {
        success: false,
        message: "Activity not found"
      };
    }

    // Verify that the requesting admin performed this action
    if (activity.userId !== adminId) {
      return {
        success: false,
        message: "You can only view activities that you performed",
        isUnauthorized: true
      };
    }

    const filteredActivity = await activityFilterService({
      document: activity,
      userType: UserTypes.ADMIN,
      selectFields: filters.selectFields
    });

    // Return complete activity information
    return {
      success: true,
      activity: filteredActivity
    };

  } catch (error) {
    logWithTime(`❌ [getActivityByIdService] Error fetching activity by ID`);
    errorMessage(error);
    return {
      success: false,
      message: "Internal error while fetching activity",
      error: error.message
    };
  }
};

module.exports = {
  getActivityByIdService
};
