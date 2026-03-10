// middlewares/admins/field-validation.middleware.js

const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");
const { FieldDefinitions } = require("@configs/field-definitions.config");
const { getValidationSet } = require("@utils/field-definition.util");

// Pre-compute validation sets from FieldDefinitions (evaluated once at boot)
const createProjectValidationSet  = getValidationSet(FieldDefinitions.CREATE_PROJECT);
const updateProjectValidationSet  = getValidationSet(FieldDefinitions.UPDATE_PROJECT);
const abortProjectValidationSet   = getValidationSet(FieldDefinitions.ABORT_PROJECT);
const completeProjectValidationSet = getValidationSet(FieldDefinitions.COMPLETE_PROJECT);
const resumeProjectValidationSet  = getValidationSet(FieldDefinitions.RESUME_PROJECT);
const deleteProjectValidationSet  = getValidationSet(FieldDefinitions.DELETE_PROJECT);
const archiveProjectValidationSet = getValidationSet(FieldDefinitions.ARCHIVE_PROJECT);

const validationMiddlewares = {
  createProjectValidationMiddleware:  validateBody("createProject",  createProjectValidationSet),
  updateProjectValidationMiddleware:  validateBody("updateProject",  updateProjectValidationSet),
  abortProjectValidationMiddleware:   validateBody("abortProject",   abortProjectValidationSet),
  completeProjectValidationMiddleware: validateBody("completeProject", completeProjectValidationSet),
  resumeProjectValidationMiddleware:  validateBody("resumeProject",  resumeProjectValidationSet),
  deleteProjectValidationMiddleware:  validateBody("deleteProject",  deleteProjectValidationSet),
  archiveProjectValidationMiddleware: validateBody("archiveProject", archiveProjectValidationSet),
};

module.exports = { validationMiddlewares };

