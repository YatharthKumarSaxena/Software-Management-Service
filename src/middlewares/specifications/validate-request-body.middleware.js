// middlewares/specifications/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createSpecificationPresenceMiddleware: checkBodyPresence("createSpecificationPresence", requiredFields.createSpecificationField),
  updateSpecificationPresenceMiddleware: checkBodyPresence("updateSpecificationPresence", requiredFields.updateSpecificationField),
  deleteSpecificationPresenceMiddleware: checkBodyPresence("deleteSpecificationPresence", requiredFields.deleteSpecificationField),
};

module.exports = { presenceMiddlewares };
