// services/requirements/list-requirements.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");

/**
 * Lists requirements for an elicitation with pagination and filtering.
 * Role-based filtering: Clients only see their own requirements and limited fields
 *
 * @param {Object} params
 * @param {string} params.elicitationId - Elicitation MongoDB ObjectId
 * @param {number} [params.limit]       - Items per page (default: 20)
 * @param {number} [params.skip]        - Skip count (default: 0)
 * @param {string} [params.sortBy]      - Sort field (default: '-createdAt')
 * @param {string} [params.status]      - Filter by status
 * @param {string} [params.userType] - USER (admin) or CLIENT
 * @param {string} [params.userId] - User/Client ID for filtering
 *
 * @returns {{ success: true, requirements, pagination } | { success: false, message, errorCode }}
 */
const listRequirementsService = async ({
  elicitationId,
  limit = 20,
  skip = 0,
  sortBy = '-createdAt',
  status,
  userType,
  userId
}) => {
  try {
    const query = { entityId: elicitationId, isDeleted: false };

    // ── Role-based filtering ───────────────────────────────────────────
    if (userType === UserTypes.CLIENT && userId) {
      query.createdBy = userId;
    }

    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await RequirementModel.countDocuments(query);

    // Get paginated results
    const requirements = await RequirementModel
      .find(query)
      .populate('entityId', 'title workflowMode')
      .populate('parentFeatureId', 'title')
      .sort(sortBy)
      .limit(limit)
      .skip(skip)
      .lean();

    const page = Math.floor(skip / limit) + 1;
    const hasMore = skip + limit < total;

    // ── Filter fields for CLIENTs ────────────────────────────────────
    let filteredRequirements = requirements;
    if (userType === UserTypes.CLIENT) {
      filteredRequirements = requirements.map(req => ({
        _id: req._id,
        title: req.title,
        description: req.description,
        type: req.type,
        status: req.status,
        priority: req.priority,
        tags: req.tags,
        acceptanceCriteria: req.acceptanceCriteria,
        parentFeatureId: req.parentFeatureId,
        linkedRequirements: req.linkedRequirements,
        timeline: req.timeline,
        attachments: req.attachments,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        entityId: req.entityId,
        entityType: req.entityType
      }));
    }

    logWithTime(`✅ [listRequirementsService] Listed ${filteredRequirements.length} requirements for elicitation: ${elicitationId}${userType === UserTypes.CLIENT ? ` (CLIENT: ${userId})` : ''}`);

    return {
      success: true,
      requirements: filteredRequirements,
      pagination: {
        total,
        page,
        limit,
        skip,
        hasMore
      }
    };

  } catch (error) {
    logWithTime(`❌ [listRequirementsService] Error: ${error.message}`);
    return { success: false, message: "Internal error while listing requirements", errorCode: INTERNAL_ERROR, error: error.message };
  }
};

module.exports = { listRequirementsService };
