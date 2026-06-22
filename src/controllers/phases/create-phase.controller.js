// controllers/phases/create-phase.controller.js

const { createPhaseService } =
require("@services/phases/create-phase.service");

const {
  throwConflictError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");

const {
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND
} = require("@configs/http-status.config");

const {
  createPhaseSuccessResponse
} = require("@responses/success/phase.response");

const createPhaseController = async (req, res) => {

  try {

    const { projectId } = req.params;

    const {
      phaseType,
      workflowMode,
      allowParallelMeetings,
      phaseStatus
    } = req.body;

    const result =
      await createPhaseService({

        projectId,

        phaseType,

        workflowMode,

        allowParallelMeetings,

        phaseStatus,

        createdBy:
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
            "Project"
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

    return createPhaseSuccessResponse(
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
  createPhaseController
};