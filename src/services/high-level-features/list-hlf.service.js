// services/high-level-features/list-hlf.service.js

const mongoose = require("mongoose");
const { HighLevelFeatureModel } = require("@models/high-level-feature.model");

const parsePagination = (pagination = {}) => {
  const page = Math.max(1, parseInt(pagination.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildHlfQuery = (filters = {}, forceIncludeDeleted = false) => {
  const {
    inceptionId,
    includeDeleted = false,
  } = filters;

  const query = {};

  const includeDeletedResolved = forceIncludeDeleted ? forceIncludeDeleted : includeDeleted;
  if (!includeDeletedResolved) {
    query.isDeleted = false;
  }

  if (inceptionId && mongoose.Types.ObjectId.isValid(inceptionId)) {
    query.inceptionId = inceptionId;
  }

  return query;
};

/**
 * Admin/full HLF list.
 */
const listHlfAdminService = async (filters = {}, pagination = {}) => {
  try {
    const query = buildHlfQuery(filters);
    const { page, limit, skip } = parsePagination(pagination);

    const [hlfs, total] = await Promise.all([
      HighLevelFeatureModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      HighLevelFeatureModel.countDocuments(query),
    ]);

    return {
      success: true,
      hlfs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching high-level features", error: error.message };
  }
};

/**
 * Restricted HLF list for client/stakeholder access.
 * Only shows basic HLF information.
 */
const listHlfClientService = async (filters = {}, pagination = {}) => {
  try {
    const query = buildHlfQuery(filters, false);
    const { page, limit, skip } = parsePagination(pagination);

    const projection = {
      _id: 1,
      title: 1,
      description: 1,
      createdAt: 1,
    };

    const [hlfs, total] = await Promise.all([
      HighLevelFeatureModel.find(query, projection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      HighLevelFeatureModel.countDocuments(query),
    ]);

    const restrictedHlfs = hlfs.map((hlf) => ({
      hlfId: hlf._id,
      title: hlf.title,
      description: hlf.description,
      createdAt: hlf.createdAt,
    }));

    return {
      success: true,
      hlfs: restrictedHlfs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching high-level features", error: error.message };
  }
};

module.exports = {
  listHlfAdminService,
  listHlfClientService,
};
