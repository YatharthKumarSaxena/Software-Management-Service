// services/requirements/filter-requirements.service.js

const { RequirementModel } = require("@models/requirement.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");

/**
 * Filter requirements based on multiple criteria.
 * Supports filtering by status, assignees, phases, priorities, types, and search term.
 * Includes pagination and sorting.
 *
 * @param {Object} params
 * @param {string} params.projectId - Project MongoDB ObjectId
 * @param {Object} params.filters - Filter criteria
 * @param {Array<string>} [params.filters.statuses] - Filter by status
 * @param {Array<string>} [params.filters.assignees] - Filter by assignee IDs
 * @param {Array<string>} [params.filters.phases] - Filter by phases
 * @param {Array<string>} [params.filters.priorities] - Filter by priority
 * @param {Array<string>} [params.filters.types] - Filter by type
 * @param {string} [params.filters.searchTerm] - Search in title or description
 * @param {Object} [params.pagination] - Pagination options
 * @param {number} [params.pagination.limit] - Items per page (default: 20)
 * @param {number} [params.pagination.skip] - Skip count (default: 0)
 * @param {Object} [params.sort] - Sort options
 * @param {string} [params.sort.field] - Sort field (default: 'createdAt')
 * @param {string} [params.sort.order] - 'asc' or 'desc' (default: 'desc')
 * @param {Object} params.auditContext - User context for audit
 *
 * @returns {{ success: true, requirements, metadata } | { success: false, message, errorCode }}
 */
const filterRequirementsService = async ({
  projectId,
  filters = {},
  pagination = {},
  sort = {},
  auditContext
}) => {
  try {
    const { statuses, assignees, phases, priorities, types, searchTerm } = filters;
    const { limit = 20, skip = 0 } = pagination;
    const { field = 'createdAt', order = 'desc' } = sort;

    // ── Build query ──────────────────────────────────────────────────────
    const query = { 
      projectId,
      isDeleted: false 
    };

    // ── Status filter ────────────────────────────────────────────────────
    if (Array.isArray(statuses) && statuses.length > 0) {
      query.status = { $in: statuses };
    }

    // ── Assignee filter ──────────────────────────────────────────────────
    if (Array.isArray(assignees) && assignees.length > 0) {
      query.assigneeId = { $in: assignees };
    }


    // ── Priority filter ──────────────────────────────────────────────────
    if (Array.isArray(priorities) && priorities.length > 0) {
      query.priority = { $in: priorities };
    }

    // ── Type filter ──────────────────────────────────────────────────────
    if (Array.isArray(types) && types.length > 0) {
      query.type = { $in: types };
    }

    // ── Search term filter ───────────────────────────────────────────────
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim().length > 0) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    // ── Role-based filtering ─────────────────────────────────────────────
    if (auditContext?.user?.userType === UserTypes.CLIENT && auditContext?.user?.userId) {
      query.createdBy = auditContext.user.userId;
    }

    // ── Get total count ──────────────────────────────────────────────────
    const total = await RequirementModel.countDocuments(query);

    // ── Build sort object ────────────────────────────────────────────────
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [field]: sortOrder };

    // ── Get paginated results ────────────────────────────────────────────
    const requirements = await RequirementModel
      .find(query)
      .populate('entityId', 'title workflowMode')
      .populate('parentFeatureId', 'title')
      .populate('assigneeId', 'name email')
      .sort(sortObj)
      .limit(limit)
      .skip(skip)
      .lean();

    const page = Math.floor(skip / limit) + 1;
    const hasMore = skip + limit < total;

    // ── Filter fields for CLIENTs ────────────────────────────────────────
    let filteredRequirements = requirements;
    if (auditContext?.user?.userType === UserTypes.CLIENT) {
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

    logWithTime(`✅ [filterRequirementsService] Filtered ${filteredRequirements.length} requirements with criteria: ${JSON.stringify({ statuses, assignees, phases, priorities, types, searchTerm })}`);

    return {
      success: true,
      requirements: filteredRequirements,
      metadata: {
        total,
        page,
        limit,
        skip,
        hasMore,
        filters: { statuses, assignees, phases, priorities, types, searchTerm },
        sort: { field, order }
      }
    };

  } catch (error) {
    logWithTime(`❌ [filterRequirementsService] Error: ${error.message}`);
    return { success: false, message: "Internal error while filtering requirements", errorCode: INTERNAL_ERROR, error: error.message };
  }
};

module.exports = { filterRequirementsService };
