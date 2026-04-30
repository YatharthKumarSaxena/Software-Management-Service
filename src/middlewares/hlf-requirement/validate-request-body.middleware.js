// middlewares/hlf-requirement/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  linkRequirementToHlfPresenceMiddleware: checkBodyPresence("linkRequirementToHlfPresence", requiredFields.linkRequirementToHlfField),
  updateRequirementToHlfPresenceMiddleware: checkBodyPresence("updateRequirementToHlfPresence", requiredFields.updateRequirementToHlfField),
  unlinkRequirementToHlfPresenceMiddleware: checkBodyPresence("unlinkRequirementToHlfPresence", requiredFields.unlinkRequirementToHlfField)
};

module.exports = { presenceMiddlewares };
