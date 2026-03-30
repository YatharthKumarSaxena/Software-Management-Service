// services/specifications/get-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getSpecificationService = async (specification) => {
  try {

    return {
      success: true,
      message: "Specification retrieved successfully",
      specification,
    };
  } catch (error) {
    console.error("[getSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getSpecificationService };
