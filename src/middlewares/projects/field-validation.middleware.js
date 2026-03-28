const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = { 
  createProjectValidationMiddleware:  validateBody("createProject",  validationSets.createProjectValidationSet),
  updateProjectValidationMiddleware:  validateBody("updateProject",  validationSets.updateProjectValidationSet),
  onHoldProjectValidationMiddleware:  validateBody("onHoldProject",  validationSets.onHoldProjectValidationSet),
  abortProjectValidationMiddleware:   validateBody("abortProject",   validationSets.abortProjectValidationSet),
  completeProjectValidationMiddleware: validateBody("completeProject", validationSets.completeProjectValidationSet),
  resumeProjectValidationMiddleware:  validateBody("resumeProject",  validationSets.resumeProjectValidationSet),
  deleteProjectValidationMiddleware:  validateBody("deleteProject",  validationSets.deleteProjectValidationSet),
  archiveProjectValidationMiddleware: validateBody("archiveProject", validationSets.archiveProjectValidationSet),
  activateProjectValidationMiddleware: validateBody("activateProject", validationSets.activateProjectValidationSet),
  changeProjectOwnerValidationMiddleware: validateBody("changeProjectOwner", validationSets.changeProjectOwnerValidationSet)
};

module.exports = { validationMiddlewares };

