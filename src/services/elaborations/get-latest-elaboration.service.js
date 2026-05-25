// services/elaborations/get-latest-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getLatestElaborationService = async ({ projectId }) => {
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

    // Get latest elaboration version
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Latest elaboration retrieved successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[getLatestElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get latest elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getLatestElaborationService };
