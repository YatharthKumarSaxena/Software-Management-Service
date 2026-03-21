// middlewares/product-requests/field-validation.middleware.js

const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");
const { FieldDefinitions } = require("@configs/field-definitions.config");
const { getValidationSet } = require("@utils/field-definition.util");

// Pre-compute validation sets from FieldDefinitions (evaluated once at boot)
const createProductRequestValidationSet  = getValidationSet(FieldDefinitions.CREATE_PRODUCT_REQUEST);
const updateProductRequestValidationSet  = getValidationSet(FieldDefinitions.UPDATE_PRODUCT_REQUEST);
const deleteProductRequestValidationSet  = getValidationSet(FieldDefinitions.DELETE_PRODUCT_REQUEST);
const approveProductRequestValidationSet = getValidationSet(FieldDefinitions.APPROVE_PRODUCT_REQUEST);
const rejectProductRequestValidationSet  = getValidationSet(FieldDefinitions.REJECT_PRODUCT_REQUEST);

const validationMiddlewares = {
  createProductRequestValidationMiddleware:  validateBody("createProductRequest",  createProductRequestValidationSet),
  updateProductRequestValidationMiddleware:  validateBody("updateProductRequest",  updateProductRequestValidationSet),
  deleteProductRequestValidationMiddleware:  validateBody("deleteProductRequest",  deleteProductRequestValidationSet),
  approveProductRequestValidationMiddleware: validateBody("approveProductRequest", approveProductRequestValidationSet),
  rejectProductRequestValidationMiddleware:  validateBody("rejectProductRequest",  rejectProductRequestValidationSet),
};

module.exports = { validationMiddlewares };
