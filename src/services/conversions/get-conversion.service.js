// services/conversions/get-conversion.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { createDocumentFilterService } = require("@services/factory/create-doc-filter-service.factory");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { UserTypes } = require("@configs/enums.config");
const { CONVERSION_ADMIN_LIST_FIELDS, CONVERSION_CLIENT_LIST_FIELDS } = require("@/configs/list-fields.config");

const adminConversionGetService = createDocumentFilterService({
    hiddenFields: CONVERSION_ADMIN_LIST_FIELDS.hiddenFields
});

const clientConversionGetService = createDocumentFilterService({
    hiddenFields: CONVERSION_CLIENT_LIST_FIELDS.hiddenFields
});

const getConversionService = async ({ conversion, selectFields, userType }) => {
  try {
    if (!conversion) {
      logWithTime(`❌ [getConversionService] Conversion not found`);
      return { success: false, message: "Conversion not found" };
    }

    const getService = userType === UserTypes.CLIENT ? clientConversionGetService : adminConversionGetService;
    const result = await getService({ document: conversion, selectFields });
    
    return result;

  } catch (error) {
    logWithTime(`❌ [getConversionService] Error: ${error.message}`);
    return {
      success: false,
      message: "Internal error while retrieving conversion",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { getConversionService };
