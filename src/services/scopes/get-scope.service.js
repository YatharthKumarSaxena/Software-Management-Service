// services/scopes/get-scope.service.js

/**
 * Admin/full view of a scope record.
 *
 * @param {Object} scope
 * @returns {{ success: boolean, scope?: Object, message?: string, error?: string }}
 */
const getScopeAdminService = async (scope) => {
  try {
    const scopeData = scope?.toObject ? scope.toObject() : scope;
    return { success: true, scope: scopeData };
  } catch (error) {
    return { success: false, message: "Internal error while fetching scope", error: error.message };
  }
};

/**
 * Restricted scope view for client/stakeholder access.
 * Filters out sensitive audit fields.
 *
 * @param {Object} scope
 * @returns {{ success: boolean, scope?: Object, message?: string, error?: string }}
 */
const getScopeClientService = async (scope) => {
  try {
    const scopeData = scope?.toObject ? scope.toObject() : scope;

    return {
      success: true,
      scope: {
        scopeId: scopeData._id,
        type: scopeData.type,
        title: scopeData.title,
        description: scopeData.description,
        createdAt: scopeData.createdAt,
      },
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching scope", error: error.message };
  }
};

module.exports = {
  getScopeAdminService,
  getScopeClientService,
};
