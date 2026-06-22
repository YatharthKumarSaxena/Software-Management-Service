// controllers/phases/index.js

const phaseRolesControllers = require("./phase-roles.controller");

const { createPhaseController } = require("./create-phase.controller");
const { updatePhaseSettingsController } = require("./update-phase-setting.controller");
const { updatePhaseStatusController } = require("./update-phase-status.controller")
const { deletePhaseController } = require("./delete-phase.controller");
const { getPhaseController } = require("./get-phase.controller");
const { getLatestPhaseController } = require("./get-latest-phase.controller");
const { listPhaseController } = require("./list-phase.controller");

const phaseControllers = {
  createPhaseController,
  updatePhaseSettingsController,
  updatePhaseStatusController,
  deletePhaseController,
  getPhaseController,
  getLatestPhaseController,
  listPhaseController
}
module.exports = {
  phaseRolesControllers,
  phaseControllers
};
