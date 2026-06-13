// services/validations/index.js

const { createValidationService } = require("./create-validation.service");
const { deleteValidationService } = require("./delete-validation.service");
const { updateValidationService } = require("./update-validation.service");
const { getValidationService } = require("./get-validation.service");
const { getLatestValidationService } = require("./get-latest-validation.service");
const { listValidationsService } = require("./list-validations.service");

const validationServices = {
  createValidationService,
  deleteValidationService,
  updateValidationService,
  getValidationService,
  getLatestValidationService,
  listValidationsService
};

module.exports = { validationServices };
