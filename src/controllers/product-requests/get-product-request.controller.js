// controllers/product-requests/get-product-request.controller.js

const { getProductRequestService } = require("@services/product-requests");
const { sendProductRequestFetchedSuccess } = require("@/responses/success/product-request.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { parseListFilters } = require("@utils/parse-list-filters.util");
const { UserTypes } = require("@configs/enums.config");

/**
 * Controller: Get Product Request
 *
 * @route  GET /software-management-service/api/v1/product-requests/:productRequestId
 * @access Private – Admin / Client (own requests only)
 *
 * @params {string} productRequestId - Product request ID
 *
 * @returns {200} Product request retrieved successfully
 * @returns {404} Product request not found
 * @returns {500} Internal server error
 */
const getProductRequestController = async (req, res) => {
  try {
    const { productRequest } = req;
    
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

    const result = await getProductRequestService(productRequest, {
      clientMongoId,
      isClient,
      selectFields: filters.selectFields,
      userType
    });

    if (!result.isSuccess) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [getProductRequestController] Not found: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwSpecificInternalServerError(res, result.description);
      }
      if (result.errorCode === INTERNAL_ERROR) {
        logWithTime(`❌ [getProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
        return throwInternalServerError(res, result.description);
      }

      logWithTime(`❌ [getProductRequestController] Internal error: ${result.description} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.description);
    }

    logWithTime(`✅ [getProductRequestController] Product request fetched successfully | ${getLogIdentifiers(req)}`);
    return sendProductRequestFetchedSuccess(res, result.data.productRequest);

  } catch (error) {
    logWithTime(`❌ [getProductRequestController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getProductRequestController };
