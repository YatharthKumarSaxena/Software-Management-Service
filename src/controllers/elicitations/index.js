// controllers/elicitations/index.js

const { createElicitationController } = require("./create-elicitation.controller");
const { deleteElicitationController } = require("./delete-elicitation.controller");
const { freezeElicitationController } = require("./freeze-elicitation.controller");
const { getElicitationController } = require("./get-elicitation.controller");
const { getLatestElicitationController } = require("./get-latest-elicitation.controller");
const { listElicitationsController } = require("./list-elicitations.controller");
const { updateElicitationController } = require("./update-elicitation.controller");

const elicitationControllers = {
  createElicitationController,
  deleteElicitationController,
  freezeElicitationController,
  getElicitationController,
  getLatestElicitationController,
  listElicitationsController,
  updateElicitationController,
};

module.exports = { elicitationControllers };
