// controllers/meetings/participants/index.js

const { addParticipantController } = require("./add-participant.controller");
const { removeParticipantController } = require("./remove-participant.controller");
const { updateParticipantController } = require("./update-participant.controller");
const { getParticipantController } = require("./get-participant.controller");
const { listParticipantsController } = require("./list-participants.controller");

const participantControllers = {
  addParticipantController,
  removeParticipantController,
  updateParticipantController,
  getParticipantController,
  listParticipantsController
};

module.exports = { participantControllers };