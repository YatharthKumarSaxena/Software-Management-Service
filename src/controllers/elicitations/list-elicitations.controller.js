// controllers/elicitations/list-elicitations.controller.js

const { listElicitationsService } = require("@services/elicitations/list-elicitations.service");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: List Elicitations
 *
 * @route  GET /software-management-service/api/v1/admin/projects/:projectId/elicitations
 * @access Private – Admin (must be stakeholder of the project)
 *
 * @param projectId - Project ID from URL params
 * @query {number} [page] - Page number (default: 1)
 * @query {number} [limit] - Items per page (default: 20)
 * @query {string} [sort] - Sort order (default: -createdAt)
 *
 * @description Retrieves all elicitations for a project (non-deleted only).
 *
 * @returns {200} Elicitations list retrieved successfully
 * @returns {403} User is not a stakeholder of the project
 * @returns {500} Internal server error
 */
const listElicitationsController = async (req, res) => {
  try {
    const projectId = req.project._id;
    const { page = 1, limit = 20, sort = "-createdAt" } = req.query;

    // ── Call service ──────────────────────────────────────────────────
    const result = await listElicitationsService({
      projectId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
    });

    if (!result.success) {
      logWithTime(`❌ [listElicitationsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Success response ──────────────────────────────────────────────
    logWithTime(`✅ [listElicitationsController] Elicitations retrieved successfully | ${getLogIdentifiers(req)}`);
    return res.status(result.errorCode).json({
      success: true,
      message: "Elicitations retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });

  } catch (error) {
    logWithTime(`❌ [listElicitationsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listElicitationsController };
