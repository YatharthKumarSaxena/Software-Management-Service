// controllers/negotiations/index.js

const { createNegotiationController } = require("./create-negotiation.controller");
const { deleteNegotiationController } = require("./delete-negotiation.controller");
const { updateNegotiationController } = require("./update-negotiation.controller");
const { getNegotiationController } = require("./get-negotiation.controller");
const { getLatestNegotiationController } = require("./get-latest-negotiation.controller");
const { listNegotiationsController } = require("./list-negotiations.controller");

const negotiationControllers = {
  createNegotiationController,
  deleteNegotiationController,
  updateNegotiationController,
  getNegotiationController,
  getLatestNegotiationController,
  listNegotiationsController
};

module.exports = { negotiationControllers };
