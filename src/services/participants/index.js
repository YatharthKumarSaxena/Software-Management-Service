const { addParticipantService } = require("./add-participant.service");
const { removeParticipantService } = require("./remove-participant.service");
const { updateParticipantService } = require("./update-participant.service");
const { getParticipantService } = require("./get-participant.service");
const { listParticipantsService } = require("./list-participants.service");

module.exports = {
  addParticipantService,
  removeParticipantService,
  updateParticipantService,
  getParticipantService,
  listParticipantsService
};
