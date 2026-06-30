// services/stakeholders/list-stakeholders.service.js

const mongoose = require("mongoose");
const { StakeholderModel } = require("@models/stakeholder.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { STAKEHOLDER_ADMIN_LIST_FIELDS, STAKEHOLDER_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const adminStakeholderListService = createListService({
  model: StakeholderModel,
  hiddenFields: STAKEHOLDER_ADMIN_LIST_FIELDS.hiddenFields,
  searchableFields: STAKEHOLDER_ADMIN_LIST_FIELDS.searchableFields,
  sortableFields: STAKEHOLDER_ADMIN_LIST_FIELDS.sortableFields,
  filterableFields: STAKEHOLDER_ADMIN_LIST_FIELDS.filterableFields
});

const clientStakeholderListService = createListService({
  model: StakeholderModel,
  hiddenFields: STAKEHOLDER_CLIENT_LIST_FIELDS.hiddenFields,
  searchableFields: STAKEHOLDER_CLIENT_LIST_FIELDS.searchableFields,
  sortableFields: STAKEHOLDER_CLIENT_LIST_FIELDS.sortableFields,
  filterableFields: STAKEHOLDER_CLIENT_LIST_FIELDS.filterableFields
});

const buildStakeholderQuery = (filters = {}, forceUserId = null, forceIncludeDeleted = null) => {
  const andConditions = [];

  const includeDeletedResolved = forceIncludeDeleted === null ? false : forceIncludeDeleted; // Defaults to false
  if (!includeDeletedResolved) {
    andConditions.push({ field: "isDeleted", operator: "eq", value: false });
  }

  if (forceUserId) {
    andConditions.push({ field: "userId", operator: "eq", value: forceUserId });
  }

  if (filters?.query) {
    andConditions.push(filters.query);
  }

  return { and: andConditions };
};

/**
 * Admin/full stakeholder list.
 */
const listStakeholdersAdminService = async (filters = {}) => {
  try {
    const query = buildStakeholderQuery(filters, null, filters.query?.isDeleted || false);

    const result = await adminStakeholderListService({
      query,
      selectFields: filters.selectFields,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      sortField: filters.sortField,
      sortOrder: filters.sortOrder
    });

    return { success: true, stakeholders: result.data, pagination: result.pagination };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholders", error: error.message };
  }
};

/**
 * Restricted stakeholder list for stakeholder/member access.
 */
const listStakeholdersClientService = async (filters = {}, requesterUserId = null) => {
  try {
    if (!requesterUserId) {
      return { success: false, message: "Requester userId is required for restricted stakeholder list" };
    }

    const query = buildStakeholderQuery(filters, requesterUserId, false);

    const result = await clientStakeholderListService({
      query,
      selectFields: filters.selectFields,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      sortField: filters.sortField,
      sortOrder: filters.sortOrder
    });

    const restrictedStakeholders = result.data.map((stakeholder) => ({
      stakeholderId: stakeholder.userId,
      role: stakeholder.role,
      phase: stakeholder.phase,
      joinedAt: stakeholder.createdAt,
      projectId: stakeholder.projectId,
    }));

    return { success: true, stakeholders: restrictedStakeholders, pagination: result.pagination };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholders", error: error.message };
  }
};

module.exports = {
  listStakeholdersAdminService,
  listStakeholdersClientService,
};
