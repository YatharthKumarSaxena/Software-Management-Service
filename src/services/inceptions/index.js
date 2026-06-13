// services/inceptions/index.js

const { createInceptionService } = require("./create-inception.service");
const { deleteInceptionService } = require("./delete-inception.service");
const { getInceptionService } = require("./get-inception.service");
const { getLatestInceptionService } = require("./get-latest-inception.service");
const { listInceptionsService } = require("./list-inceptions.service");
const { updateInceptionService } = require("./update-inception.service");

const inceptionServices = {
  createInceptionService,
  deleteInceptionService,
  updateInceptionService,
  getInceptionService,
  getLatestInceptionService,
  listInceptionsService
};

module.exports = { inceptionServices };
