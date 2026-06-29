// controllers/requirements/index.js

const { createRequirementController } = require("./create-requirement.controller");
const { listRequirementsController } = require("./list-requirements.controller");
const { getRequirementController } = require("./get-requirement.controller");
const { bulkCreateRequirementController } = require("./bulk-create-requirement.controller");

const requirementControllers = {
  createRequirementController,
  getRequirementController,
  listRequirementsController,
  bulkCreateRequirementController,
};  

module.exports = {
  requirementControllers
};
