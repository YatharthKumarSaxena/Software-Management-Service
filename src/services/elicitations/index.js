// services/elicitations/index.js

const { createElicitationService } = require("./create-elicitation.service");
const { deleteElicitationService } = require("./delete-elicitation.service");
const { getElicitationService } = require("./get-elicitation.service");
const { listElicitationsService } = require("./list-elicitations.service");
const { updateElicitationService } = require("./update-elicitation.service");

const elicitationServices = {
  createElicitationService,
  deleteElicitationService,
  getElicitationService,
  listElicitationsService,
  updateElicitationService,
};

module.exports = { elicitationServices };
