// controllers/projects/get-projects-client.controller.js

const { listProjectsClientService } = require("@services/projects/get-project.service");
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
 * All valid status values a client may filter by.
 * Clients can only see non-deleted/non-archived projects.
 */
const VALID_STATUSES = Object.values(ProjectStatus);
const VALID_PHASES   = Object.values(Phases);

/**
 * Controller: Get Project List – Client View
 *
 * @route  GET /software-management-service/api/v1/admin/get-projects-client
 * @access Private – All admin roles (serves client-facing data)
 *
 * Query params (all optional):
 *   projectStatus {string}           - filter by status
 *   currentPhase  {string}           - filter by phase
 *   projectIds    {string|string[]}  - comma-separated or repeated param
 *   fields        {string|string[]}  - comma-separated safe field names
 *   page          {number}           - default 1
 *   limit         {number}           - default 20, max 100
 *
 * Deleted projects are NEVER returned.
 * Field selection is limited to the client-safe whitelist.
 *
 * @returns {200} Paginated project list (restricted fields)
 * @returns {400} Invalid filter values
 * @returns {500} Internal server error
 */
const getProjectsClientController = async (req, res) => {
  try {
    const { projectStatus, currentPhase } = req.query;

    // ── Validate enum filters ─────────────────────────────────────────────────
    if (projectStatus && !VALID_STATUSES.includes(projectStatus)) {
      logWithTime(`❌ [getProjectsClientController] Invalid projectStatus filter | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(
        res,
        "Invalid projectStatus filter",
        `Allowed values: ${VALID_STATUSES.join(", ")}`
      );
    }
    if (currentPhase && !VALID_PHASES.includes(currentPhase)) {
      logWithTime(`❌ [getProjectsClientController] Invalid currentPhase filter | ${getLogIdentifiers(req)}`);
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
      projectIds,
    };

    const result = await listProjectsClientService(filters, { page, limit, selectFields });

    if (!result.success) {
      logWithTime(`❌ [getProjectsClientController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getProjectsClientController] Projects list fetched successfully | ${getLogIdentifiers(req)}`);
    return sendProjectsListFetchedSuccess(res, result.projects, result.total, result.page, result.totalPages);
  } catch (error) {
    logWithTime(`❌ [getProjectsClientController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getProjectsClientController };
