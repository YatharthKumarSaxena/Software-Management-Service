// controllers/requirements/index.js

const { createRequirementController } = require("./create-requirement.controller");
const { listRequirementsController } = require("./list-requirements.controller");
const { getRequirementController } = require("./get-requirement.controller");
const { bulkCreateRequirementController } = require("./bulk-create-requirement.controller");
const { deleteRequirementController } = require("./delete-requirement.controller");
const { updateRequirementController } = require("./update-requirement.controller");

const requirementControllers = {
  createRequirementController,
  getRequirementController,
  listRequirementsController,
  bulkCreateRequirementController,
  deleteRequirementController,
  updateRequirementController
};  

module.exports = {
  requirementControllers
};
