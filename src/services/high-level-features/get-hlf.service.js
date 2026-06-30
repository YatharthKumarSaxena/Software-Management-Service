// services/high-level-features/get-hlf.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const {
    HLF_ADMIN_LIST_FIELDS,
    HLF_CLIENT_LIST_FIELDS
} = require("@/configs/list-fields.config");

const adminHlfGetService = createDocumentFilterService({
    hiddenFields: HLF_ADMIN_LIST_FIELDS.hiddenFields
});

const clientHlfGetService = createDocumentFilterService({
    hiddenFields: HLF_CLIENT_LIST_FIELDS.hiddenFields
});

const getHlfService = async ({ hlf, selectFields, userType }) => {
  try {
    if (!hlf) {
      logWithTime(`❌ [getHlfService] HLF not found or is deleted`);
      return { success: false, message: "HLF not found or is deleted" };
    }

    const getService = userType === UserTypes.CLIENT ? clientHlfGetService : adminHlfGetService;
    const result = await getService({ document: hlf, selectFields });
    
    return result;

  } catch (error) {
    logWithTime(`❌ [getHlfService] Error: ${error.message}`);
    return {
      success: false,
      message: "Internal error while retrieving high-level feature",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { getHlfService };
