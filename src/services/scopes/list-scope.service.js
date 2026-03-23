// services/scopes/list-scope.service.js

const mongoose = require("mongoose");
const { ScopeModel } = require("@models/scope-model");

const parsePagination = (pagination = {}) => {
  const page = Math.max(1, parseInt(pagination.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildScopeQuery = (filters = {}, forceIncludeDeleted = false) => {
  const {
    inceptionId,
    type,
    includeDeleted = false,
  } = filters;

  const query = {};

  const includeDeletedResolved = forceIncludeDeleted ? forceIncludeDeleted :includeDeleted;
  if (!includeDeletedResolved) {
    query.isDeleted = false;
  }

  if (inceptionId && mongoose.Types.ObjectId.isValid(inceptionId)) {
    query.inceptionId = inceptionId;
  }

  if (type) {
    query.type = type;
  }

  return query;
};

/**
 * Admin/full scope list.
 */
const listScopesAdminService = async (filters = {}, pagination = {}) => {
  try {
    const query = buildScopeQuery(filters);
    const { page, limit, skip } = parsePagination(pagination);

    const [scopes, total] = await Promise.all([
      ScopeModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ScopeModel.countDocuments(query),
    ]);

    return {
      success: true,
      scopes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching scopes", error: error.message };
  }
};

/**
 * Restricted scope list for client/stakeholder access.
 * Only shows basic scope information.
 */
const listScopesClientService = async (filters = {}, pagination = {}) => {
  try {
    const query = buildScopeQuery(filters, false);
    const { page, limit, skip } = parsePagination(pagination);

    const projection = {
      _id: 1,
      type: 1,
      title: 1,
      description: 1,
      createdAt: 1,
    };

    const [scopes, total] = await Promise.all([
      ScopeModel.find(query, projection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ScopeModel.countDocuments(query),
    ]);

    const restrictedScopes = scopes.map((scope) => ({
      scopeId: scope._id,
      type: scope.type,
      title: scope.title,
      description: scope.description,
      createdAt: scope.createdAt,
    }));

    return {
      success: true,
      scopes: restrictedScopes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching scopes", error: error.message };
  }
};

module.exports = {
  listScopesAdminService,
  listScopesClientService,
};
