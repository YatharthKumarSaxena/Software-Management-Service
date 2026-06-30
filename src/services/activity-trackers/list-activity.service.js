const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");
const { createListService } = require("@services/factory/create-list-service.factory");
const { ACTIVITY_TRACKER_ADMIN_LIST_FIELDS } = require("@/configs/list-fields.config");

const adminActivityListService = createListService({
  model: ActivityTrackerModel,
  hiddenFields: ACTIVITY_TRACKER_ADMIN_LIST_FIELDS.hiddenFields,
  searchableFields: ACTIVITY_TRACKER_ADMIN_LIST_FIELDS.searchableFields,
  sortableFields: ACTIVITY_TRACKER_ADMIN_LIST_FIELDS.sortableFields,
  filterableFields: ACTIVITY_TRACKER_ADMIN_LIST_FIELDS.filterableFields
});

/**
 * List all activities with full details (Admin only)
 * Shows complete activity tracker information
 * Accessible by admin only with full access control
 * 
 * @param {Object} filters - Extracted from parseListFilters
 */
const listActivityService = async (filters = {}) => {
  try {
    const andConditions = [];

    if (filters.userId) {
      andConditions.push({ field: "userId", operator: "eq", value: filters.userId });
    }
    if (filters.eventType) {
      andConditions.push({ field: "eventType", operator: "eq", value: filters.eventType });
    }
    if (filters.dateFrom) {
      andConditions.push({ field: "createdAt", operator: "gte", value: new Date(filters.dateFrom) });
    }
    if (filters.dateTo) {
      andConditions.push({ field: "createdAt", operator: "lte", value: new Date(filters.dateTo) });
    }
    if (filters.query) {
      andConditions.push(filters.query);
    }

    const query = { and: andConditions };

    const result = await adminActivityListService({
      query,
      selectFields: filters.selectFields,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      sortField: filters.sortField || "timestamp",
      sortOrder: filters.sortOrder || "desc"
    });

    return {
      success: true,
      activities: result.data,
      pagination: result.pagination
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