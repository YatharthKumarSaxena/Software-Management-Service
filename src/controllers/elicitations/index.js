// controllers/elicitations/index.js

const { createElicitationController } = require("./create-elicitation.controller");
const { deleteElicitationController } = require("./delete-elicitation.controller");
const { getElicitationController } = require("./get-elicitation.controller");
const { listElicitationsController } = require("./list-elicitations.controller");
const { updateElicitationController } = require("./update-elicitation.controller");

const elicitationControllers = {
  createElicitationController,
  deleteElicitationController,
  getElicitationController,
  listElicitationsController,
  updateElicitationController,
};

module.exports = { elicitationControllers };
