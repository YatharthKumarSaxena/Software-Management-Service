// middlewares/admins/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createProjectPresenceMiddleware:   checkBodyPresence("createProjectPresence",   requiredFields.createProjectField),
  updateProjectPresenceMiddleware:   checkBodyPresence("updateProjectPresence",   requiredFields.updateProjectField),
  onHoldProjectPresenceMiddleware:   checkBodyPresence("onHoldProjectPresence",   requiredFields.onHoldProjectField),
  abortProjectPresenceMiddleware:    checkBodyPresence("abortProjectPresence",    requiredFields.abortProjectField),
  completeProjectPresenceMiddleware: checkBodyPresence("completeProjectPresence", requiredFields.completeProjectField),
  resumeProjectPresenceMiddleware:   checkBodyPresence("resumeProjectPresence",   requiredFields.resumeProjectField),
  deleteProjectPresenceMiddleware:   checkBodyPresence("deleteProjectPresence",   requiredFields.deleteProjectField),
  archiveProjectPresenceMiddleware:  checkBodyPresence("archiveProjectPresence",  requiredFields.archiveProjectField),
  activateProjectPresenceMiddleware:  checkBodyPresence("activateProjectPresence",  requiredFields.activateProjectField),
  changeProjectOwnerPresenceMiddleware: checkBodyPresence("changeProjectOwnerPresence", requiredFields.changeProjectOwnerField)
};

module.exports = { presenceMiddlewares };
