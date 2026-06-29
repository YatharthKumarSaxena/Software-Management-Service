// services/stakeholders/get-stakeholder.service.js

const { createDocumentFilterService } = require("@services/factory/create-document-filter.service");
const { UserTypes } = require("@configs/enums.config");
const { STAKEHOLDER_ADMIN_LIST_FIELDS, STAKEHOLDER_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const stakeholderFilterService = createDocumentFilterService({
  hiddenFields: {
    [UserTypes.ADMIN]: STAKEHOLDER_ADMIN_LIST_FIELDS.hiddenFields,
    [UserTypes.CLIENT]: STAKEHOLDER_CLIENT_LIST_FIELDS.hiddenFields,
  }
});

const getStakeholderAdminService = async (stakeholder, filters = {}) => {
  try {
    const filteredStakeholder = await stakeholderFilterService({
      document: stakeholder,
      userType: UserTypes.ADMIN,
      selectFields: filters.selectFields
    });

    return { success: true, stakeholder: filteredStakeholder };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholder", error: error.message };
  }
};

const getStakeholderClientService = async (stakeholder, filters = {}) => {
  try {
    const filteredStakeholder = await stakeholderFilterService({
      document: stakeholder,
      userType: UserTypes.CLIENT,
      selectFields: filters.selectFields
    });

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
