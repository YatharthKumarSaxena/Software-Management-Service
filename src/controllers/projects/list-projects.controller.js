// controllers/projects/list-projects.controller.js

const { listProjectsService } = require("@services/projects/list-project.service");
const { sendProjectsListFetchedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { BAD_REQUEST } = require("@configs/http-status.config");
const { TotalTypes } = require("@configs/enums.config");

const listProjectsController = async (req, res) => {
  try {
    const filters = parseListFilters(req.query);

    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;
    const userId = req.stakeholder?.userId || req.admin?.adminId || req.client?.clientId;

    const result = await listProjectsService({
      filters,
      userType,
      userId
    });

    if (!result.success) {
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }

      logWithTime(`❌ [listProjectsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ ${result.pagination.totalCount} project(s) fetched successfully | ${getLogIdentifiers(req)}`);
    return sendProjectsListFetchedSuccess(res, result.data, result.pagination);
  } catch (error) {
    logWithTime(`❌ [listProjectsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listProjectsController };
