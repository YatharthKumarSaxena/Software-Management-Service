// controllers/phases/update-phase-status.controller.js

const {
  updatePhaseStatusService
} = require("@services/phases/update-phase-status.service");

const {
  throwBadRequestError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");

const {
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND
} = require("@configs/http-status.config");

const {
  updatePhaseStatusSuccessResponse
} = require("@responses/success/phase.response");

const updatePhaseStatusController =
async (req, res) => {

  try {

    const { projectId } = req.params;

    const {
      phaseType,
      phaseStatus
    } = req.body;

    const result =
      await updatePhaseStatusService({

        projectId,

        phaseType,

        phaseStatus,

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

        case BAD_REQUEST:
          return throwBadRequestError(
            res,
            result.message
          );

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

        default:
          return throwInternalServerError(
            res,
            new Error(result.message)
          );
      }
    }

    return updatePhaseStatusSuccessResponse(
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
  updatePhaseStatusController
};