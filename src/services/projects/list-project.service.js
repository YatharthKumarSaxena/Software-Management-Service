// services/projects/list-project.service.js

const { ProjectModel } = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { PROJECT_ADMIN_LIST_FIELDS, PROJECT_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

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

/**
 * Builds the common list filter object for createListService
 * @param {Object} filters - Extracted from parseListFilters
 * @param {boolean} isAdmin - Whether the caller is an admin
 * @param {string[]} [allowedProjectIds] - restricted project IDs for clients
 */
const buildListQuery = (filters = {}, isAdmin = false, allowedProjectIds = null) => {
  const andConditions = [];

  // Clients never see deleted
  if (!isAdmin) {
    andConditions.push({ field: "isDeleted", operator: "eq", value: false });
  }

  if (allowedProjectIds !== null) {
    andConditions.push({ field: "_id", operator: "in", value: allowedProjectIds });
  }

  if (filters?.query) {
    andConditions.push(filters.query);
  }

  return { and: andConditions };
};

const listProjectsAdminService = async (filters = {}) => {
  try {
    const query = buildListQuery(filters, true);
    
    const result = await adminProjectListService({
      query,
      selectFields: filters.selectFields,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      sortField: filters.sortField,
      sortOrder: filters.sortOrder
    });

    return { success: true, projects: result.data, pagination: result.pagination };
  } catch (error) {
    return { success: false, message: "Internal error while listing projects", error: error.message };
  }
};

const listProjectsClientService = async (filters = {}, requesterUserId = null) => {
  try {
    if (!requesterUserId) {
      return { success: false, message: "Requester userId is required for restricted project list" };
    }

    const stakeholderMemberships = await StakeholderModel
      .find({ userId: requesterUserId, isDeleted: false }, { projectId: 1, _id: 0 })
      .lean();

    if (!stakeholderMemberships.length) {
      return {
        success: true,
        projects: [],
        pagination: { total: 0, page: filters.pageNumber || 1, limit: filters.pageSize || 10, pages: 0 },
      };
    }

    const accessibleProjectIds = stakeholderMemberships.map((item) => item.projectId.toString());
    const query = buildListQuery(filters, false, accessibleProjectIds);

    const result = await clientProjectListService({
      query,
      selectFields: filters.selectFields,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      sortField: filters.sortField,
      sortOrder: filters.sortOrder
    });

    return { success: true, projects: result.data, pagination: result.pagination };
  } catch (error) {
    return { success: false, message: "Internal error while listing projects", error: error.message };
  }
};

module.exports = {
  listProjectsAdminService,
  listProjectsClientService,
};