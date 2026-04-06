// middlewares/ideas/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = { 
  createIdeaValidationMiddleware: validateBody("createIdea", validationSets.createIdeaValidationSet),
  updateIdeaValidationMiddleware: validateBody("updateIdea", validationSets.updateIdeaValidationSet),
  acceptIdeaValidationMiddleware: validateBody("acceptIdea", validationSets.acceptIdeaValidationSet),
  rejectIdeaValidationMiddleware: validateBody("rejectIdea", validationSets.rejectIdeaValidationSet),
  deferIdeaValidationMiddleware: validateBody("deferIdea", validationSets.deferIdeaValidationSet),
  reopenIdeaValidationMiddleware: validateBody("reopenIdea", validationSets.reopenIdeaValidationSet)
};

module.exports = { validationMiddlewares };
