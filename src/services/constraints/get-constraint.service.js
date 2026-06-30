// services/constraints/get-constraint.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { CONSTRAINT_ADMIN_LIST_FIELDS, CONSTRAINT_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const adminConstraintGetService = createDocumentFilterService({
    hiddenFields: CONSTRAINT_ADMIN_LIST_FIELDS.hiddenFields
});

const clientConstraintGetService = createDocumentFilterService({
    hiddenFields: CONSTRAINT_CLIENT_LIST_FIELDS.hiddenFields
});

/**
 * Retrieves a single constraint filtered by user type projection.
 *
 * @param {Object} params
 * @param {Object} params.constraint - The Constraint document
 * @param {string[]} params.selectFields - Optional field projection array
 * @param {string} params.userType - UserTypes.USER | UserTypes.CLIENT
 * @returns {{ success: boolean, data?: Object, message?: string }}
 */
const getConstraintService = async ({ constraint, selectFields, userType }) => {
  try {
    if (!constraint) {
      logWithTime(`❌ [getConstraintService] Constraint not found or is deleted`);
      return { success: false, message: "Constraint not found or is deleted" };
    }

    const getService = userType === UserTypes.CLIENT ? clientConstraintGetService : adminConstraintGetService;
    const result = await getService({ document: constraint, selectFields });

    return result;

  } catch (error) {
    logWithTime(`❌ [getConstraintService] Error: ${error.message}`);
    return {
      success: false,
      message: "Internal error while retrieving constraint",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { getConstraintService };
