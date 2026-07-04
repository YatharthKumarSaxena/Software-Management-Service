// middlewares/conversions/index.js

const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { fetchConversionMiddleware } = require("./fetch-conversion.middleware");

const conversionMiddlewares = {
  ...presenceMiddlewares,
  ...validationMiddlewares,
  fetchConversionMiddleware
}

module.exports = {
  conversionMiddlewares
};
