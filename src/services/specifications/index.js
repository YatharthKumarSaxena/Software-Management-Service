// services/specifications/index.js

const { createSpecificationService } = require("./create-specification.service");
const { deleteSpecificationService } = require("./delete-specification.service");
const { updateSpecificationService } = require("./update-specification.service");
const { getSpecificationService } = require("./get-specification.service");
const { getLatestSpecificationService } = require("./get-latest-specification.service");
const { listSpecificationsService } = require("./list-specifications.service");

const specificationServices = {
  createSpecificationService,
  deleteSpecificationService,
  updateSpecificationService,
  getSpecificationService,
  getLatestSpecificationService,
  listSpecificationsService
};

module.exports = { specificationServices };
