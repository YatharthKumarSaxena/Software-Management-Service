// controllers/projects/get-projects-admin.controller.js

const { listProjectsAdminService, listProjectsClientService } = require("@services/projects/list-project.service");
const { sendProjectsListFetchedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { ProjectStatus, Phases } = require("@configs/enums.config");

/**
 * Allowed status values for query filtering.
 */
const VALID_STATUSES = Object.values(ProjectStatus);
const VALID_PHASES   = Object.values(Phases);

/**
 * Controller: Get Project List – Admin View
 *
 * @route  GET /software-management-service/api/v1/admin/get-projects
 * @access Private – All admin roles
 *
 * Query params (all optional):
 *   projectStatus  {string}           - filter by status
 *   currentPhase   {string}           - filter by phase
 *   isArchived     {boolean}          - "true" | "false"
 *   includeDeleted {boolean}          - "true" | "false" (default: false)
 *   createdBy      {string}           - admin USR ID
 *   search         {string}           - partial name search
 *   projectIds     {string|string[]}  - comma-separated or repeated param
 *   fields         {string|string[]}  - comma-separated field names to project
 *   page           {number}           - default 1
 *   limit          {number}           - default 20, max 100
 *
 * @returns {200} Paginated project list
 * @returns {400} Invalid filter values
 * @returns {500} Internal server error
 */
const listProjectsController = async (req, res) => {
  try {
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    const {
      projectStatus,
      currentPhase,
      isArchived,
      includeDeleted,
      createdBy,
      search,
    } = req.query;

    // ── Validate enum filters ─────────────────────────────────────────────────
    if (projectStatus && !VALID_STATUSES.includes(projectStatus)) {
      return throwBadRequestError(
        res,
        "Invalid projectStatus filter",
        `Allowed values: ${VALID_STATUSES.join(", ")}`
      );
    }
    if (currentPhase && !VALID_PHASES.includes(currentPhase)) {
      return throwBadRequestError(
        res,
        "Invalid currentPhase filter",
        `Allowed values: ${VALID_PHASES.join(", ")}`
      );
    }

    // ── Parse array params ────────────────────────────────────────────────────
    const rawProjectIds = req.query.projectIds;
    let projectIds;
    if (rawProjectIds) {
      projectIds = Array.isArray(rawProjectIds)
        ? rawProjectIds
        : rawProjectIds.split(",").map((id) => id.trim()).filter(Boolean);
    }

    const rawFields = req.query.fields;
    let selectFields;
    if (rawFields) {
      selectFields = Array.isArray(rawFields)
        ? rawFields
        : rawFields.split(",").map((f) => f.trim()).filter(Boolean);
    }

    // ── Parse pagination ──────────────────────────────────────────────────────
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const filters = {
      projectStatus,
      currentPhase,
      isArchived: isArchived === "true" ? true : isArchived === "false" ? false : undefined,
      includeDeleted: includeDeleted === "true",
      createdBy,
      search,
      projectIds
    };

    const requesterUserId = req.stakeholder?.userId || req.admin?.adminId || req.client?.clientId;
    const result = shouldUseRestrictedView
      ? await listProjectsClientService(filters, { page, limit, selectFields }, requesterUserId)
      : await listProjectsAdminService(filters, { page, limit, selectFields });

    if (!result.success) {
      logWithTime(`❌ [listProjectsAdminController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ Projects list fetched successfully | ${getLogIdentifiers(req)}`);
    return sendProjectsListFetchedSuccess(res, result.projects, result.total, result.page, result.totalPages);
  } catch (error) {
    logWithTime(`❌ [listProjectsAdminController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listProjectsController };
