// services/inceptions/index.js

const { createInceptionService } = require("./create-inception.service");
const { deleteInceptionService } = require("./delete-inception.service");
const { freezeInceptionService } = require("./freeze-inception.service");
const { getInceptionService } = require("./get-latest-inception.service");
const { listInceptionsService } = require("./list-inceptions.service");

const inceptionServices = {
  createInceptionService,
  deleteInceptionService,
  freezeInceptionService,
  getInceptionService,
  listInceptionsService
};

module.exports = { inceptionServices };
