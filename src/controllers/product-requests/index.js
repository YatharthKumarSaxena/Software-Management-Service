// controllers/product-requests/index.js

const { createProductRequestController } = require("./create-product-request.controller");
const { updateProductRequestController } = require("./update-product-request.controller");
const { deleteProductRequestController } = require("./delete-product-request.controller");
const { getProductRequestController } = require("./get-product-request.controller");
const { listProductRequestsController } = require("./list-product-requests");
const { approveProductRequestController } = require("./approve-product-request.controller");
const { rejectProductRequestController } = require("./reject-product-request.controller");
const { cancelProductRequestController } = require("./cancel-product-request.controller");

const productRequestControllers = {
  createProductRequestController,
  updateProductRequestController,
  deleteProductRequestController,
  getProductRequestController,
  listProductRequestsController,
  approveProductRequestController,
  rejectProductRequestController,
  cancelProductRequestController,
};

module.exports = { productRequestControllers };
