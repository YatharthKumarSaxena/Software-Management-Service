// middlewares/org-project-requests/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createOrgProjectRequestPresenceMiddleware:   checkBodyPresence("createOrgProjectRequestPresence",   requiredFields.createOrgProjectRequestField),
  updateOrgProjectRequestPresenceMiddleware:   checkBodyPresence("updateOrgProjectRequestPresence",   requiredFields.updateOrgProjectRequestField),
  approveOrgProjectRequestPresenceMiddleware:  checkBodyPresence("approveOrgProjectRequestPresence",  requiredFields.approveOrgProjectRequestField),
  rejectOrgProjectRequestPresenceMiddleware:   checkBodyPresence("rejectOrgProjectRequestPresence",   requiredFields.rejectOrgProjectRequestField)
};

module.exports = { presenceMiddlewares };
