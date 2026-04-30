// services/hlf-requirement/list-requirement-to-hlf.service.js

const mongoose = require("mongoose");
const { FeatureRequirementMappingModel } = require("@models/feature-requirement-map.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");

/**
 * Lists requirement-HLF mappings with optional filtering and pagination.
 * Role-based filtering: Clients only see their own requirement mappings
 * Can filter by:
 * - projectId (required for filtering)
 * - featureId (list mappings for a specific HLF)
 * - requirementId (list HLFs for a specific requirement)
 * 
 * @param {Object} params
 * @param {string} params.projectId - Project ID (optional but recommended)
 * @param {string} [params.featureId] - Filter by HLF
 * @param {string} [params.requirementId] - Filter by requirement
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.userType] - USER (admin) or CLIENT
 * @param {string} [params.userId] - User/Client ID for filtering
 * 
 * @returns {{ success: true, mappings, pagination } | { success: false, message, errorCode }}
 */
const listRequirementToHlfService = async ({
  projectId,
  featureId,
  requirementId,
  page = 1,
  limit = 10,
  userType,
  userId
}) => {
  try {
    logWithTime(
      `📍 [listRequirementToHlfService] Listing requirement-HLF mappings | Page: ${page}, Limit: ${limit}`
    );

    // ── 1. Build query filter ──────────────────────────────────────────
    const filter = {
      isDeleted: false
    };

    if (projectId) {
      filter.projectId = new mongoose.Types.ObjectId(projectId);
    }

    if (featureId) {
      filter.featureId = new mongoose.Types.ObjectId(featureId);
    }

    if (requirementId) {
      filter.requirementId = new mongoose.Types.ObjectId(requirementId);
    }

    // ── 2. Calculate pagination ────────────────────────────────────────
    const skip = (page - 1) * limit;

    // ── 3. Fetch total count ───────────────────────────────────────────
    const total = await FeatureRequirementMappingModel.countDocuments(filter);

    // ── 4. Fetch mappings with populated references ────────────────────
    const mappings = await FeatureRequirementMappingModel.find(filter)
      .populate('featureId', 'title description')
      .populate('requirementId', 'title description status type createdBy')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    logWithTime(
      `✅ [listRequirementToHlfService] Listed ${mappings.length} mappings (Total: ${total})`
    );

    // ── 5. Role-based filtering for CLIENTs ──────────────────────────
    let filteredMappings = mappings;
    if (userType === UserTypes.CLIENT && userId) {
      // Client can only see mappings where they created the requirement
      filteredMappings = mappings.filter(mapping => 
        mapping.requirementId?.createdBy === userId
      );
      
      logWithTime(
        `📍 [listRequirementToHlfService] Filtered mappings for CLIENT ${userId}: ${filteredMappings.length} of ${mappings.length}`
      );
    }

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit)
    };

    return { success: true, mappings: filteredMappings, pagination };

  } catch (error) {
    logWithTime(`❌ [listRequirementToHlfService] Error: ${error.message}`);
    return { 
      success: false, 
      message: "Error listing requirement-HLF mappings", 
      errorCode: INTERNAL_ERROR,
      error: error.message
    };
  }
};

module.exports = { listRequirementToHlfService };
