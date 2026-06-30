// services/ideas/get-idea.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const {
    IDEA_ADMIN_LIST_FIELDS,
    IDEA_CLIENT_LIST_FIELDS
} = require("@/configs/list-fields.config");

const adminIdeaGetService = createDocumentFilterService({
    hiddenFields: IDEA_ADMIN_LIST_FIELDS.hiddenFields
});

const clientIdeaGetService = createDocumentFilterService({
    hiddenFields: IDEA_CLIENT_LIST_FIELDS.hiddenFields
});

/**
 * Retrieves a single idea document with field filtering.
 */
const getIdeaService = async ({ idea, selectFields, userType }) => {
  try {
    if (!idea) {
      logWithTime(`❌ [getIdeaService] Idea not found or is deleted`);
      return {
        success: false,
        message: "Idea not found or is deleted"
      };
    }

    const getService = userType === UserTypes.CLIENT ? clientIdeaGetService : adminIdeaGetService;
    const result = await getService({ document: idea, selectFields });
    
    return result;

  } catch (error) {
    logWithTime(`❌ [getIdeaService] Error: ${error.message}`);
    return {
      success: false,
      message: "Internal error while retrieving idea",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { getIdeaService };
