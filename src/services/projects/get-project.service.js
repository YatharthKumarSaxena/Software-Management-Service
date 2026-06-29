// services/projects/get-project.service.js

const { StakeholderModel } = require("@models/stakeholder.model");
const { createDocumentFilterService } = require("@services/factory/create-document-filter.service");
const { UserTypes } = require("@configs/enums.config");
const { PROJECT_ADMIN_LIST_FIELDS, PROJECT_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const projectFilterService = createDocumentFilterService({
  hiddenFields: {
    [UserTypes.ADMIN]: PROJECT_ADMIN_LIST_FIELDS.hiddenFields,
    [UserTypes.CLIENT]: PROJECT_CLIENT_LIST_FIELDS.hiddenFields,
  }
});

const getProjectAdminService = async (project, filters = {}) => {
  try {
    const stakeholders = await StakeholderModel
      .find({ projectId: project._id, isDeleted: false })
      .lean();

    const filteredProject = await projectFilterService({
      document: project,
      userType: UserTypes.ADMIN,
      selectFields: filters.selectFields
    });

    return {
      success: true,
      project: {
        ...filteredProject,
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

    const filteredProject = await projectFilterService({
      document: project,
      userType: UserTypes.CLIENT,
      selectFields: filters.selectFields
    });

    return {
      success: true,
      project: {
        ...filteredProject,
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
