// services/elaborations/get-elaboration.service.js

const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getElaborationService = async (elaboration) => {
  try {

    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Elaboration retrieved successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[getElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getElaborationService };
