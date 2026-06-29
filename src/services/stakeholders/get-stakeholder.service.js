// services/stakeholders/get-stakeholder.service.js

const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { STAKEHOLDER_ADMIN_LIST_FIELDS, STAKEHOLDER_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const adminStakeholderFilterService = createDocumentFilterService({
  hiddenFields: STAKEHOLDER_ADMIN_LIST_FIELDS.hiddenFields
});

const clientStakeholderFilterService = createDocumentFilterService({
  hiddenFields: STAKEHOLDER_CLIENT_LIST_FIELDS.hiddenFields
});

const getStakeholderAdminService = async (stakeholder, filters = {}) => {
  try {
    const filteredResult = await adminStakeholderFilterService({
      document: stakeholder,
      selectFields: filters.selectFields
    });

    if (!filteredResult.success) {
      return filteredResult;
    }

    return { success: true, stakeholder: filteredResult.data };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholder", error: error.message };
  }
};

const getStakeholderClientService = async (stakeholder, filters = {}) => {
  try {
    const filteredResult = await clientStakeholderFilterService({
      document: stakeholder,
      selectFields: filters.selectFields
    });

    if (!filteredResult.success) {
      return filteredResult;
    }

    const filteredStakeholder = filteredResult.data;

    return {
      success: true,
      stakeholder: {
        stakeholderId: filteredStakeholder.userId,
        role: filteredStakeholder.role,
        phase: filteredStakeholder.phase,
        joinedAt: filteredStakeholder.createdAt,
      },
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholder", error: error.message };
  }
};

module.exports = {
  getStakeholderAdminService,
  getStakeholderClientService,
};
