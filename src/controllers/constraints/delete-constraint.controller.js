// controllers/constraints/delete-constraint.controller.js

const { deleteConstraintService } = require("@services/constraints/delete-constraint.service");
const { sendConstraintDeletedSuccess } = require("@/responses/success/constraint.response");

const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { PriorityLevels } = require("@/configs/enums.config");

const deleteConstraintController = async (req, res) => {
  try {
    const { deletionReasonDescription } = req.body;
    const deletedBy = req.admin.adminId;

    const constraint = req.constraint;
    const inception = req.inception;
    const project = req.project;

    // ── Check if deletion reason is required based on project criticality ──────
    if (project.projectCriticality === PriorityLevels.HIGH && !deletionReasonDescription) {
      logWithTime(`❌ [deleteConstraintController] Missing deletion reason for HIGH criticality project | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(
        res,
        "Deletion reason is required",
        "This project has HIGH criticality. Deletion reason description is mandatory."
      );
    }

    const result = await deleteConstraintService({
      constraint,
      inception,
      project,
      deletionReasonDescription: deletionReasonDescription || null,
      deletedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Validation error") {
        logWithTime(`❌ [deleteConstraintController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }
      logWithTime(`❌ [deleteConstraintController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [deleteConstraintController] Constraint deleted successfully | ${getLogIdentifiers(req)}`);
    return sendConstraintDeletedSuccess(res);

  } catch (error) {
    logWithTime(`❌ [deleteConstraintController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteConstraintController };
