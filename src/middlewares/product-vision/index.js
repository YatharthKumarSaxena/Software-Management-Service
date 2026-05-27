// middlewares/product-vision/index.js

const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const productVisionMiddlewares = {
  ...validationMiddlewares,
  ...presenceMiddlewares,
};

module.exports = { productVisionMiddlewares };
