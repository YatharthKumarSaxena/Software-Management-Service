// controllers/phases/delete-phase.controller.js

const {
  deletePhaseService
} = require("@services/phases/delete-phase.service");

const {
  throwConflictError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError
} = require("@responses/common/error-handler.response");

const { logWithTime } = require("@utils/time-stamps.util");

const {
  CONFLICT,
  NOT_FOUND,
  BAD_REQUEST
} = require("@configs/http-status.config");

const {
  deletePhaseSuccessResponse
} = require("@responses/success/phase.response");

const deletePhaseController = async (
  req,
  res
) => {

  try {

    const { projectId } = req.params;

    const {
      phaseType,
      deletionReasonType,
      deletionReasonDescription
    } = req.body;

    const result =
      await deletePhaseService({

        projectId,

        phaseType,

        deletionReasonType,

        deletionReasonDescription,

        deletedBy:
          req.admin.adminId,

        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      });

    if (!result.success) {

      switch (result.errorCode) {

        case NOT_FOUND:

          return throwDBResourceNotFoundError(
            res,
            result.message.includes("Project")
              ? "Project"
              : "Phase"
          );

        case CONFLICT:

          return throwConflictError(
            res,
            result.message
          );

        case BAD_REQUEST:

          return throwBadRequestError(
            res,
            result.message
          );

        default:

          return throwSpecificInternalServerError(
            res,
            result.message
          );
      }
    }

    logWithTime(`✅ ${phaseType} phase deleted successfully`);

    return deletePhaseSuccessResponse(
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
  deletePhaseController
};