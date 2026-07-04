// controllers/conversions/index.js

const { createConversionController } = require("./create-conversion.controller");
const { getConversionController } = require("./get-conversion.controller");
const { listConversionsController } = require("./list-conversions.controller");

const conversionControllers = {
  createConversionController,
  getConversionController,
  listConversionsController
};

module.exports = { conversionControllers };
