// services/phases/index.js

const phaseRolesServices = require("./phase-roles.service");
const { createPhaseService } = require("./create-phase.service");
const { deletePhaseService } = require("./delete-phase.service");
const { listPhaseService } = require("./list-phase.service");
const { updatePhaseSettingsService } = require("./update-phase-settings.service");
const { updatePhaseStatusService } = require("./update-phase-status.service");

const phaseServices = {
  createPhaseService,
  deletePhaseService,
  listPhaseService,
  updatePhaseSettingsService,
  updatePhaseStatusService
}

module.exports = {
  phaseServices,
  phaseRolesServices
};
