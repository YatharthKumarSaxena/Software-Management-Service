// services/negotiations/get-latest-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getLatestNegotiationService = async ({ projectId }) => {
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

    // Get latest negotiation version
    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
    }).sort({
      "version.major": -1,
      "version.minor": -1
    });

    if (!negotiation) {
      return {
        success: false,
        message: "Negotiation not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Latest negotiation retrieved successfully",
      negotiation,
    };
  } catch (error) {
    console.error("[getLatestNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get latest negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getLatestNegotiationService };
