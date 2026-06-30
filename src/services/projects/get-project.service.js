// services/projects/get-project.service.js

const { StakeholderModel } = require("@models/stakeholder.model");
const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { PROJECT_ADMIN_LIST_FIELDS, PROJECT_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const adminProjectFilterService = createDocumentFilterService({
  hiddenFields: PROJECT_ADMIN_LIST_FIELDS.hiddenFields
});

const clientProjectFilterService = createDocumentFilterService({
  hiddenFields: PROJECT_CLIENT_LIST_FIELDS.hiddenFields
});

const getProjectAdminService = async (project, filters = {}) => {
  try {
    const stakeholders = await StakeholderModel
      .find({ projectId: project._id, isDeleted: false })
      .lean();

    const filteredResult = await adminProjectFilterService({
      document: project,
      selectFields: filters.selectFields
    });

    if (!filteredResult.success) {
      return filteredResult;
    }

    return {
      success: true,
      project: {
        ...filteredResult.data,
        stakeholders,
      },
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching project", error: error.message };
  }
};

const getProjectClientService = async (project, filters = {}, requestStakeholder = null) => {
  try {
    const safeStakeholder = requestStakeholder
      ? {
        stakeholderId: requestStakeholder.userId,
        role: requestStakeholder.role,
        phase: requestStakeholder.phase,
        joinedAt: requestStakeholder.createdAt,
      }
      : null;

    const filteredResult = await clientProjectFilterService({
      document: project,
      selectFields: filters.selectFields
    });

    if (!filteredResult.success) {
      return filteredResult;
    }

    return {
      success: true,
      project: {
        ...filteredResult.data,
        stakeholder: safeStakeholder,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Internal error while fetching project",
      error: error.message
    };
  }
};

module.exports = {
  getProjectAdminService,
  getProjectClientService
};
