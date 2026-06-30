// controllers/high-level-features/list-hlf.controller.js

const { listHlfService } = require("@services/high-level-features/list-hlf.service");
const { sendHlfListFetchedSuccess } = require("@/responses/success/hlf.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { UserTypes } = require("@configs/enums.config");
const { BAD_REQUEST } = require("@configs/http-status.config");

const listHlfController = async (req, res) => {
  try {
    const inception = req.inception;
    const project = req.project;
    const filters = parseListFilters(req.query);
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;

    const result = await listHlfService({
      projectId: project._id,
      inceptionId: inception ? inception._id : null,
      filters,
      userType
    });

    if (!result.success) {
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      logWithTime(`❌ [listHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listHlfController] High-level features fetched successfully | ${getLogIdentifiers(req)}`);
    return sendHlfListFetchedSuccess(res, result.data, result.pagination.totalCount, result.pagination.currentPage, result.pagination.totalPages);

  } catch (error) {
    logWithTime(`❌ [listHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listHlfController };
