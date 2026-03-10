// middlewares/admins/validate-request-body.middleware.js

const {
  createProjectField,
  updateProjectField,
  abortProjectField,
  completeProjectField,
  resumeProjectField,
  deleteProjectField,
  archiveProjectField,
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createProjectPresenceMiddleware:  checkBodyPresence(createProjectField),
  updateProjectPresenceMiddleware:  checkBodyPresence(updateProjectField),
  abortProjectPresenceMiddleware:   checkBodyPresence(abortProjectField),
  completeProjectPresenceMiddleware: checkBodyPresence(completeProjectField),
  resumeProjectPresenceMiddleware:  checkBodyPresence(resumeProjectField),
  deleteProjectPresenceMiddleware:  checkBodyPresence(deleteProjectField),
  archiveProjectPresenceMiddleware: checkBodyPresence(archiveProjectField),
};

module.exports = { presenceMiddlewares };
