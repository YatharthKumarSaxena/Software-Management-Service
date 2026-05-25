// services/validations/get-latest-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getLatestValidationService = async ({ projectId }) => {
  try {
    // Check project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND,
      };
    }

    // Get latest validation version
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!validation) {
      return {
        success: false,
        message: "Validation not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Latest validation retrieved successfully",
      validation,
    };
  } catch (error) {
    console.error("[getLatestValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get latest validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getLatestValidationService };
