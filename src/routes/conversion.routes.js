// routes/conversions/conversion.routes.js

const express = require("express");
const conversionRouter = express.Router();

const { createConversionController } = require("@controllers/conversions/create-conversion.controller");

module.exports = {
  conversionRouter
};
