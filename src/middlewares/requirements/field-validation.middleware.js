// middlewares/requirements/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = { 
  // ── Create, Read, Update, Delete ─────────────────────────────────────
  createRequirementValidationMiddleware: validateBody("createRequirement", validationSets.createRequirementValidationSet),
  updateRequirementValidationMiddleware: validateBody("updateRequirement", validationSets.updateRequirementValidationSet),
  deleteRequirementValidationMiddleware: validateBody("deleteRequirement", validationSets.deleteRequirementValidationSet),
  
  // ── Status Transitions ───────────────────────────────────────────────
  transitionRequirementToReviewValidationMiddleware: validateBody("transitionRequirementToReview", validationSets.transitionRequirementToReviewValidationSet),
  issueRequirementValidationMiddleware: validateBody("issueRequirement", validationSets.issueRequirementValidationSet),
  acceptRequirementValidationMiddleware: validateBody("acceptRequirement", validationSets.acceptRequirementValidationSet),
  rejectRequirementValidationMiddleware: validateBody("rejectRequirement", validationSets.rejectRequirementValidationSet),
  revokeRequirementValidationMiddleware: validateBody("revokeRequirement", validationSets.revokeRequirementValidationSet),
  deferRequirementValidationMiddleware: validateBody("deferRequirement", validationSets.deferRequirementValidationSet),
  revertToDraftValidationMiddleware: validateBody("revertToDraft", validationSets.revertToDraftValidationSet),
  
  // ── Assignment & Collaboration ───────────────────────────────────────
  assignRequirementValidationMiddleware: validateBody("assignRequirement", validationSets.assignRequirementValidationSet),
  unassignRequirementValidationMiddleware: validateBody("unassignRequirement", validationSets.unassignRequirementValidationSet),
  assignCollaboratorValidationMiddleware: validateBody("assignCollaborator", validationSets.assignCollaboratorValidationSet),
  unassignCollaboratorValidationMiddleware: validateBody("unassignCollaborator", validationSets.unassignCollaboratorValidationSet)
};

module.exports = { validationMiddlewares };
