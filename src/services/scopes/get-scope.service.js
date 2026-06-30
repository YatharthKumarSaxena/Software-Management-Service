// services/scopes/get-scope.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { SCOPE_ADMIN_LIST_FIELDS, SCOPE_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const adminScopeGetService = createDocumentFilterService({
    hiddenFields: SCOPE_ADMIN_LIST_FIELDS.hiddenFields
});

const clientScopeGetService = createDocumentFilterService({
    hiddenFields: SCOPE_CLIENT_LIST_FIELDS.hiddenFields
});

const getScopeService = async ({ scope, selectFields, userType }) => {
  try {
    if (!scope) {
      logWithTime(`❌ [getScopeService] Scope not found or is deleted`);
      return { success: false, message: "Scope not found or is deleted" };
    }

    const getService = userType === UserTypes.CLIENT ? clientScopeGetService : adminScopeGetService;
    const result = await getService({ document: scope, selectFields });
    
    return result;

  } catch (error) {
    logWithTime(`❌ [getScopeService] Error: ${error.message}`);
    return {
      success: false,
      message: "Internal error while retrieving scope",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { getScopeService };
