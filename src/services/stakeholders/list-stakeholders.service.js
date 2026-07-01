// services/stakeholders/list-stakeholders.service.js

const { StakeholderModel } = require("@models/stakeholder.model");
const { createListService } = require("@services/factory/create-list-service.factory");
const { STAKEHOLDER_ADMIN_LIST_FIELDS, STAKEHOLDER_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { UserTypes } = require("@configs/enums.config");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

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

const listStakeholdersService = async ({
  projectId,
  filters,
  userType
}) => {
  try {
    const listService = userType === UserTypes.CLIENT ? clientStakeholderListService : adminStakeholderListService;

    const andConditions = [
      { field: "projectId", operator: "eq", value: projectId },
      { field: "isDeleted", operator: "eq", value: false }
    ];

    if (filters?.query) {
      andConditions.push(filters.query);
    }

    const query = { and: andConditions };

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
    logWithTime(`❌ [listStakeholdersService] ${error.message}`);

    return {
      success: false,
      message: error.message || "Failed to list stakeholders",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  listStakeholdersService,
};
