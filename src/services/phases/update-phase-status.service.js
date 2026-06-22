// services/phases/update-phase-status.service.js

const mongoose = require("mongoose");

const { ProjectModel } = require("@models/project.model");

const { Phases } =
require("@configs/enums.config");

const {
  updatePhaseStatus
} = require("@services/common/phase-management.service");

const {
  NOT_FOUND,
  BAD_REQUEST,
  INTERNAL_ERROR
} = require("@configs/http-status.config");

const updatePhaseStatusService = async ({
  projectId,
  phaseType,
  phaseStatus,
  updatedBy,
  auditContext
}) => {

  try {

    if (!Object.values(Phases).includes(phaseType)) {
      return {
        success: false,
        message: "Invalid phase type",
        errorCode: BAD_REQUEST
      };
    }

    const project =
      await ProjectModel.findById(projectId);

    if (!project) {
      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND
      };
    }

    const Model =
      mongoose.model(phaseType);

    const phase =
      await Model.findOne({
        projectId,
        isDeleted: false
      }).sort({
        "version.major": -1,
        "version.minor": -1
      });

    if (!phase) {
      return {
        success: false,
        message: "Phase not found",
        errorCode: NOT_FOUND
      };
    }

    const result =
      await updatePhaseStatus({

        phaseDocument: phase,

        phase: phaseType,

        nextStatus: phaseStatus,

        updatedBy,

        auditContext
      });

    return result;

  } catch (error) {

    return {
      success: false,
      message: error.message,
      errorCode: INTERNAL_ERROR
    };

  }
};

module.exports = {
  updatePhaseStatusService
};