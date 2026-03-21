// services/product-requests/index.js

const { createProductRequestService } = require("./create-product-request.service");
const { updateProductRequestService } = require("./update-product-request.service");
const { deleteProductRequestService } = require("./delete-product-request.service");
const { getProductRequestService } = require("./get-product-request.service");
const { listProductRequestsService } = require("./list-product-requests.service");
const { approveProductRequestService } = require("./approve-product-request.service");
const { rejectProductRequestService } = require("./reject-product-request.service");
const { cancelProductRequestService } = require("./cancel-product-request.service");

module.exports = {
  createProductRequestService,
  updateProductRequestService,
  deleteProductRequestService,
  getProductRequestService,
  listProductRequestsService,
  approveProductRequestService,
  rejectProductRequestService,
  cancelProductRequestService
};
