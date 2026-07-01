// controllers/stakeholders/list-stakeholders.controller.js

const { listStakeholdersService } = require("@/services/stakeholders/list-stakeholders.service");
const { enrichStakeholdersWithName } = require("@utils/resolve-stakeholder-name.util");
const { sendStakeholdersListFetchedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  throwBadRequestError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { TotalTypes } = require("@configs/enums.config");

const listStakeholdersController = async (req, res) => {
  try {

    const filters = parseListFilters(req.query);

    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;
    const project = req.project;

    const result = await listStakeholdersService({
      projectId: project._id,
      filters,
      userType
    });

    if (!result.success) {
      if (result.errorCode === require("@configs/http-status.config").BAD_REQUEST) {
          return throwBadRequestError(res, result.message);
      }
      logWithTime(`❌ [listStakeholdersController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    const stakeholdersResponse = userType === UserTypes.CLIENT
      ? result.data
      : await enrichStakeholdersWithName(result.data);

    logWithTime(`✅ ${result.pagination.totalCount} stakeholder(s) fetched successfully | ${getLogIdentifiers(req)}`);
    
    return sendStakeholdersListFetchedSuccess(
      res,
      stakeholdersResponse,
      result.pagination
    );
  } catch (error) {
    logWithTime(`❌ [listStakeholdersController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listStakeholdersController };
