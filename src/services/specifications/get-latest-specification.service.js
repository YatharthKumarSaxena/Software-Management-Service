// services/specifications/get-latest-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getLatestSpecificationService = async ({ projectId }) => {
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

    // Get latest specification version
    const specification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!specification) {
      return {
        success: false,
        message: "Specification not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Latest specification retrieved successfully",
      specification,
    };
  } catch (error) {
    console.error("[getLatestSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get latest specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getLatestSpecificationService };
