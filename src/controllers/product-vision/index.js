// controllers/product-vision/index.js

const { createProductVisionController } = require("./create-product-vision.controller");
const { deleteProductVisionController } = require("./delete-product-vision.controller");
const { getProductVisionController } = require("./get-product-vision.controller");
const { updateProductVisionController } = require("./update-product-vision.controller");

const productVisionControllers = {
    createProductVisionController,
    updateProductVisionController,
    getProductVisionController,
    deleteProductVisionController
}

module.exports = { productVisionControllers };
