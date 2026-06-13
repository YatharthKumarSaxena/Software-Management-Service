// services/negotiations/index.js

const { createNegotiationService } = require("./create-negotiation.service");
const { deleteNegotiationService } = require("./delete-negotiation.service");
const { updateNegotiationService } = require("./update-negotiation.service");
const { getNegotiationService } = require("./get-negotiation.service");
const { getLatestNegotiationService } = require("./get-latest-negotiation.service");
const { listNegotiationsService } = require("./list-negotiations.service");

const negotiationServices = {
  createNegotiationService,
  deleteNegotiationService,
  updateNegotiationService,
  getNegotiationService,
  getLatestNegotiationService,
  listNegotiationsService
};

module.exports = { negotiationServices };
