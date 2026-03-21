// responses/success/product-request.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after a product request is successfully created.
 *
 * @param {Object} res             - Express response object
 * @param {Object} productRequest  - Newly created product request document
 */
const sendProductRequestCreatedSuccess = (res, productRequest) => {
  return res.status(CREATED).json({
    success: true,
    message: "Product request created successfully.",
    data: {
      productRequest,
    },
  });
};

/**
 * Sends a 200 response after a product request is successfully updated.
 *
 * @param {Object} res             - Express response object
 * @param {Object} productRequest  - Updated product request document
 */
const sendProductRequestUpdatedSuccess = (res, productRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Product request updated successfully.",
    data: { productRequest },
  });
};

/**
 * Sends a 200 response after a product request is successfully deleted.
 *
 * @param {Object} res - Express response object
 */
const sendProductRequestDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Product request deleted successfully.",
  });
};

/**
 * Sends a 200 response after a product request is successfully retrieved.
 *
 * @param {Object} res             - Express response object
 * @param {Object} productRequest  - Product request document
 */
const sendProductRequestRetrievedSuccess = (res, productRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Product request retrieved successfully.",
    data: { productRequest },
  });
};

/**
 * Sends a 200 response with list of product requests.
 *
 * @param {Object} res              - Express response object
 * @param {Array} productRequests   - Array of product request documents
 * @param {Object} pagination       - Pagination information
 */
const sendProductRequestsListSuccess = (res, productRequests, pagination) => {
  return res.status(OK).json({
    success: true,
    message: "Product requests retrieved successfully.",
    data: {
      productRequests,
      pagination,
    },
  });
};

/**
 * Sends a 200 response after a product request is successfully approved.
 *
 * @param {Object} res             - Express response object
 * @param {Object} productRequest  - Approved product request document
 */
const sendProductRequestApprovedSuccess = (res, productRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Product request approved successfully.",
    data: { productRequest },
  });
};

/**
 * Sends a 200 response after a product request is successfully rejected.
 *
 * @param {Object} res             - Express response object
 * @param {Object} productRequest  - Rejected product request document
 */
const sendProductRequestRejectedSuccess = (res, productRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Product request rejected successfully.",
    data: { productRequest },
  });
};

/**
 * Sends a 200 response after a product request is successfully cancelled.
 *
 * @param {Object} res             - Express response object
 * @param {Object} productRequest  - Cancelled product request document
 */
const sendProductRequestCancelledSuccess = (res, productRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Product request cancelled successfully.",
    data: { productRequest },
  });
};

module.exports = {
  sendProductRequestCreatedSuccess,
  sendProductRequestUpdatedSuccess,
  sendProductRequestDeletedSuccess,
  sendProductRequestRetrievedSuccess,
  sendProductRequestsListSuccess,
  sendProductRequestApprovedSuccess,
  sendProductRequestRejectedSuccess,
  sendProductRequestCancelledSuccess,
};
