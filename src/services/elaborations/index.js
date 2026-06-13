// services/elaborations/index.js

const { createElaborationService } = require("./create-elaboration.service");
const { deleteElaborationService } = require("./delete-elaboration.service");
const { updateElaborationService } = require("./update-elaboration.service");
const { getElaborationService } = require("./get-elaboration.service");
const { getLatestElaborationService } = require("./get-latest-elaboration.service");
const { listElaborationsService } = require("./list-elaborations.service");

const elaborationServices = {
  createElaborationService,
  deleteElaborationService,
  updateElaborationService,
  getElaborationService,
  getLatestElaborationService,
  listElaborationsService
};

module.exports = { elaborationServices };
