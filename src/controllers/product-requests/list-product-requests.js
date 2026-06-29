// controllers/product-requests/list-product-requests.js

const { listProductRequestsService } = require("@services/product-requests");
const { sendProductRequestsListSuccess } = require("@/responses/success/product-request.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { UserTypes } = require("@configs/enums.config");

const listProductRequestsController = async (req, res) => {
  try {
    let isClient = false;
    let clientMongoId = null;

    if (req.admin) {
      isClient = false;
    } else if (req.client) {
      clientMongoId = req.client._id;
      isClient = true;
    }

    const filters = parseListFilters(req.query);
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;

    const result = await listProductRequestsService({
      clientMongoId,
      isClient,
      filters,
      userType
    });

    if (!result.isSuccess) {
      if (result.errorCode === INTERNAL_ERROR) {
        logWithTime(`❌ [listProductRequestsController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwInternalServerError(res, result.description);
      }
      logWithTime(`❌ [listProductRequestsController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [listProductRequestsController] Product requests listed successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestsListSuccess(res, result.data, result.pagination);

  } catch (error) {
    logWithTime(`❌ [listProductRequestsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listProductRequestsController };
