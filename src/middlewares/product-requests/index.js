// middlewares/product-requests/index.js

const { fetchProductRequestMiddleware } = require("./active-product-request.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { productRequestApiAuthorizationMiddleware } = require("./product-request-api-authorization.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const productRequestMiddlewares = {
  fetchProductRequestMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
  ...productRequestApiAuthorizationMiddleware
};

module.exports = { productRequestMiddlewares };
