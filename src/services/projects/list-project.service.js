// services/projects/list-project.service.js

const { ProjectModel } = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { PROJECT_ADMIN_LIST_FIELDS, PROJECT_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { TotalTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminProjectListService = createListService({
  model: ProjectModel,
  hiddenFields: PROJECT_ADMIN_LIST_FIELDS.hiddenFields,
  searchableFields: PROJECT_ADMIN_LIST_FIELDS.searchableFields,
  sortableFields: PROJECT_ADMIN_LIST_FIELDS.sortableFields,
  filterableFields: PROJECT_ADMIN_LIST_FIELDS.filterableFields
});

const clientProjectListService = createListService({
  model: ProjectModel,
  hiddenFields: PROJECT_CLIENT_LIST_FIELDS.hiddenFields,
  searchableFields: PROJECT_CLIENT_LIST_FIELDS.searchableFields,
  sortableFields: PROJECT_CLIENT_LIST_FIELDS.sortableFields,
  filterableFields: PROJECT_CLIENT_LIST_FIELDS.filterableFields
});

const listProjectsService = async ({
  filters,
  userType,
  userId
}) => {
  try {
    const listService =
      userType === TotalTypes.CLIENT
        ? clientProjectListService
        : adminProjectListService;

    const stakeholderMemberships = await StakeholderModel
      .find({ userId, isDeleted: false }, { projectId: 1, _id: 0 })
      .lean();

    if (!stakeholderMemberships.length) {
      return {
        success: true,
        data: [],
        pagination: { 
          totalCount: 0, 
          pageNumber: filters?.pageNumber || 1, 
          pageSize: filters?.pageSize || 10, 
          totalPages: 0 
        }
      };
    }

    const accessibleProjectIds = stakeholderMemberships.map((item) => item.projectId.toString());

    const andConditions = [
      {
        field: "_id",
        operator: "in",
        value: accessibleProjectIds
      },
      {
        field: "isDeleted",
        operator: "eq",
        value: false
      }
    ];

    if (filters?.query) {
      andConditions.push(filters.query);
    }

    const query = {
      and: andConditions
    };

    const result = await listService({
      query,
      selectFields: filters?.selectFields,
      pageNumber: filters?.pageNumber,
      pageSize: filters?.pageSize,
      sortField: filters?.sortField,
      sortOrder: filters?.sortOrder
    });

    return result;

  } catch (error) {
    logWithTime(`❌ [listProjectsService] ${error.message}`);

    return {
      success: false,
      message: error.message || "Failed to list projects",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  listProjectsService
};