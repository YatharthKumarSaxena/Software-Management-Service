// controllers/clients/list-my-org-projects.controller.js

const { listMyOrgProjectsService } = require("@services/clients/list-my-org-projects.service");
const { HTTP_STATUS } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const {
  throwDBResourceNotFoundError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");

/**
 * GET /clients/org-projects
 * List all ACTIVE org projects for authenticated client
 * Returns: name, status, ownerId (limited details only)
 */
const listMyOrgProjectsController = async (req, res) => {
  try {
    logWithTime(`[listMyOrgProjectsController] Listing org projects`);

    const clientId = req.clientId || req.user?.clientId;
    const { page = 1, limit = 10 } = req.query;

    const result = await listMyOrgProjectsService({
      clientId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    if (!result.success) {
      if (result.message.includes("Client not found")) {
        return throwDBResourceNotFoundError(res, "Client");
      }
      return throwInternalServerError(res, new Error(result.message));
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Organization projects retrieved successfully.",
      data: {
        orgProjects: result.projects,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit
        }
      }
    });

  } catch (error) {
    logWithTime(`❌ [listMyOrgProjectsController] Error: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listMyOrgProjectsController };
