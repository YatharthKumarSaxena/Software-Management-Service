// services/requirements/index.js

const { createRequirementService } = require("./create-requirement.service");
const { updateRequirementService } = require("./update-requirement.service");
const { deleteRequirementService } = require("./delete-requirement.service");
const { fetchRequirementService } = require("./fetch-requirement.service");
const { listRequirementsService } = require("./list-requirements.service");
const {
  issueRequirementService,
  deferRequirementService,
  acceptRequirementService,
  rejectRequirementService,
  revertToDraftService,
  revokeRequirementService
} = require("./requirement-state-transitions.service");
const { assignRequirementService } = require("./assign-requirement.service");
const { unassignRequirementService } = require("./unassign-requirement.service");
const { removeCollaboratorService } = require("./remove-collaborator.service");
const { listCollaboratorsService } = require("./list-collaborators.service");
const { getCollaboratorService } = require("./get-collaborator.service");
const { linkRequirementService } = require("./link-requirement.service");
const { linkRequirementToHlfService } = require("../hlf-requirement/link-requirement-to-hlf.service");
const { getRequirementToHlfService } = require("../hlf-requirement/get-requirement-to-hlf.service");
const { listRequirementToHlfService } = require("../hlf-requirement/list-requirement-to-hlf.service");
const { unlinkRequirementToHlfService } = require("../hlf-requirement/unlink-requirement-to-hlf.service");
const { startReviewRequirementService } = require("./start-review-requirement.service");
const { getRequirementService } = require("./get-requirements.service");
const { assignContributorService } = require("./assign-collaborator.service");
const { unassignContributorService } = require("./unassign-collaborator.service");
const { updateLinkedRequirementService } = require("./update-linked-requirement.service");

const requirementServices = {
  createRequirementService,
  updateRequirementService,
  deleteRequirementService,
  fetchRequirementService,
  listRequirementsService,
  issueRequirementService,
  acceptRequirementService,
  deferRequirementService,
  rejectRequirementService,
  revertToDraftService,
  revokeRequirementService,
  assignRequirementService,
  unassignRequirementService,
  removeCollaboratorService,
  listCollaboratorsService,
  getCollaboratorService,
  linkRequirementService,
  linkRequirementToHlfService,
  getRequirementToHlfService,
  listRequirementToHlfService,
  unlinkRequirementToHlfService,
  getRequirementService,
  unassignRequirementService,
  assignContributorService,
  unassignContributorService,
  startReviewRequirementService,
  updateLinkedRequirementService
};

module.exports = { requirementServices };
