// services/product-requests/get-product-request.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { OK, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { PRODUCT_REQUEST_ADMIN_LIST_FIELDS, PRODUCT_REQUEST_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");
const { UserTypes } = require("@configs/enums.config");

const adminProductRequestGetService = createDocumentFilterService({
    hiddenFields: PRODUCT_REQUEST_ADMIN_LIST_FIELDS.hiddenFields
});

const clientProductRequestGetService = createDocumentFilterService({
    hiddenFields: PRODUCT_REQUEST_CLIENT_LIST_FIELDS.hiddenFields
});

const getProductRequestService = async (productRequest, params) => {
  try {
    const { clientMongoId, isClient, selectFields, userType } = params;

    if (isClient) {
      const requestExistsForClient = productRequest.requestedBy.toString() === clientMongoId?.toString();
      
      if (!requestExistsForClient) {
        logWithTime(`❌ [getProductRequestService] Client accessing unauthorized product request`);
        return {
          errorCode: NOT_FOUND,
          isSuccess: false,
          description: "Product request not found"
        };
      }
    }

    const getService = userType === UserTypes.CLIENT ? clientProductRequestGetService : adminProductRequestGetService;
    const result = await getService({ document: productRequest, selectFields });

    logWithTime(`✅ [getProductRequestService] Product request retrieved successfully: ${productRequest._id}`);
    return {
      errorCode: OK,
      isSuccess: true,
      data: { productRequest: result.data }
    };

  } catch (error) {
    logWithTime(`❌ [getProductRequestService] Error: ${error.message}`);
    return {
      errorCode: INTERNAL_ERROR,
      isSuccess: false,
      description: "Internal error while retrieving product request"
    };
  }
};

module.exports = { getProductRequestService };
