// controllers/phases/update-phase-settings.controller.js

const {
  updatePhaseSettingsService
} = require("@services/phases/update-phase-settings.service");

const {
  throwConflictError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");

const {
  CONFLICT,
  NOT_FOUND,
  BAD_REQUEST
} = require("@configs/http-status.config");

const {
  updatePhaseSettingsSuccessResponse
} = require("@responses/success/phase.response");

const updatePhaseSettingsController =
async (req, res) => {

  try {

    const { projectId } = req.params;

    const {
      phaseType,
      workflowMode,
      allowParallelMeetings
    } = req.body;

    const result =
      await updatePhaseSettingsService({

        projectId,

        phaseType,

        workflowMode:
          typeof workflowMode === "string"
            ? workflowMode
            : undefined,

        allowParallelMeetings:
          typeof allowParallelMeetings === "boolean"
            ? allowParallelMeetings
            : undefined,

        updatedBy:
          req.admin.adminId,

        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      });

    if (!result.success) {

      switch (result.errorCode) {

        case CONFLICT:
          return throwConflictError(
            res,
            result.message
          );

        case NOT_FOUND:

          return throwDBResourceNotFoundError(
            res,
            result.message.includes("Project")
              ? "Project"
              : "Phase"
          );

        case BAD_REQUEST:
          return throwBadRequestError(
            res,
            result.message
          );

        default:
          return throwInternalServerError(
            res,
            new Error(result.message)
          );
      }
    }

    return updatePhaseSettingsSuccessResponse(
      res,
      phaseType,
      result.phase,
      result.message
    );

  } catch (error) {

    return throwInternalServerError(
      res,
      error
    );
  }
};

module.exports = {
  updatePhaseSettingsController
};