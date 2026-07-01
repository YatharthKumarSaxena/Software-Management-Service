// services/projects/get-project.service.js

const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { PROJECT_ADMIN_LIST_FIELDS, PROJECT_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { TotalTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

const adminProjectGetService = createDocumentFilterService({
  hiddenFields: PROJECT_ADMIN_LIST_FIELDS.hiddenFields
});

const clientProjectGetService = createDocumentFilterService({
  hiddenFields: PROJECT_CLIENT_LIST_FIELDS.hiddenFields
});

const getProjectService = async ({
  project,
  selectFields,
  userType
}) => {
  try {
    const getService =
      userType === TotalTypes.CLIENT
        ? clientProjectGetService
        : adminProjectGetService;

    const result = await getService({
      document: project,
      selectFields
    });

    return result;
  } catch (error) {
    logWithTime(`❌ [getProjectService] ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to get project",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = {
  getProjectService
};
