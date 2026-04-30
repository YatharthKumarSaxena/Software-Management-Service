// middlewares/requirements/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  // ── Create, Read, Update, Delete ─────────────────────────────────────
  createRequirementPresenceMiddleware: checkBodyPresence("createRequirementPresence", requiredFields.createRequirementField),
  updateRequirementPresenceMiddleware: checkBodyPresence("updateRequirementPresence", requiredFields.updateRequirementField),
  deleteRequirementPresenceMiddleware: checkBodyPresence("deleteRequirementPresence", requiredFields.deleteRequirementField),
  
  // ── Status Transitions ───────────────────────────────────────────────
  transitionRequirementToReviewPresenceMiddleware: checkBodyPresence("transitionRequirementToReviewPresence", requiredFields.transitionRequirementToReviewField),
  issueRequirementPresenceMiddleware: checkBodyPresence("issueRequirementPresence", requiredFields.issueRequirementField),
  acceptRequirementPresenceMiddleware: checkBodyPresence("acceptRequirementPresence", requiredFields.acceptRequirementField),
  rejectRequirementPresenceMiddleware: checkBodyPresence("rejectRequirementPresence", requiredFields.rejectRequirementField),
  revokeRequirementPresenceMiddleware: checkBodyPresence("revokeRequirementPresence", requiredFields.revokeRequirementField),
  deferRequirementPresenceMiddleware: checkBodyPresence("deferRequirementPresence", requiredFields.deferRequirementField),
  revertToDraftPresenceMiddleware: checkBodyPresence("revertToDraftPresence", requiredFields.revertToDraftField),
  
  // ── Assignment & Collaboration ───────────────────────────────────────
  assignRequirementPresenceMiddleware: checkBodyPresence("assignRequirementPresence", requiredFields.assignRequirementField),
  unassignRequirementPresenceMiddleware: checkBodyPresence("unassignRequirementPresence", requiredFields.unassignRequirementField),
  assignCollaboratorPresenceMiddleware: checkBodyPresence("assignCollaboratorPresence", requiredFields.assignCollaboratorField),
  unassignCollaboratorPresenceMiddleware: checkBodyPresence("unassignCollaboratorPresence", requiredFields.unassignCollaboratorField)
};

module.exports = { presenceMiddlewares };
