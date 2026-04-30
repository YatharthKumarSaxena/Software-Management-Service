// controllers/requirements/index.js

const { createRequirementController } = require("./create-requirement.controller");
const { updateRequirementController } = require("./update-requirement.controller");
const { deleteRequirementController } = require("./delete-requirement.controller");
const { fetchRequirementController } = require("./fetch-requirement.controller");
const { listRequirementsController } = require("./list-requirements.controller");
const { issueRequirementController } = require("./issue-requirement.controller");
const { acceptRequirementController } = require("./accept-requirement.controller");
const { rejectRequirementController } = require("./reject-requirement.controller");
const { revokeRequirementController } = require("./revoke-requirement.controller");
const { revertToDraftController } = require("./revert-to-draft.controller");
const { linkRequirementController } = require("./link-requirement.controller");
const { assignRequirementController } = require("./assign-requirement.controller");
const { unassignRequirementController } = require("./unassign-requirement.controller");
const { assignCollaboratorsToRequirementController } = require("./assign-collaborators-to-requirement.controller");
const { getCollaboratorController } = require("./get-collaborator.controller");
const { listCollaboratorController } = require("./list-collaborator.controller");
const { unassignCollaboratorController } = require("./unassign-collaborator.controller");
const { unlinkRequirementController } = require("./unlink-requirement.controller");
const { filterRequirementsController } = require("./filter-requirements.controller");
const { startReviewRequirementController } = require("./start-review-requirement.controller");

module.exports = {
  createRequirementController,
  updateRequirementController,
  deleteRequirementController,
  fetchRequirementController,
  listRequirementsController,
  issueRequirementController,
  acceptRequirementController,
  rejectRequirementController,
  revokeRequirementController,
  revertToDraftController,
  linkRequirementController,
  unlinkRequirementController,
  assignRequirementController,
  unassignRequirementController,
  assignCollaboratorsToRequirementController,
  getCollaboratorController,
  listCollaboratorController,
  unassignCollaboratorController,
  startReviewRequirementController,
  filterRequirementsController
};
