// controllers/constraints/update-constraint.controller.js

const { updateConstraintService } = require("@services/constraints/update-constraint.service");
const { sendConstraintUpdatedSuccess } = require("@/responses/success/constraint.response");

const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { OK } = require("@/configs/http-status.config");

const updateConstraintController = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const updatedBy = req.admin.adminId;

    const constraint = req.constraint;
    const inception = req.inception;
    const project = req.project;

    const result = await updateConstraintService({
      constraint,
      inception,
      project,
      title: title || null,
      description: description || null,
      type: type || null,
      updatedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Constraint with this title already exists in this project.") {
        logWithTime(`❌ [updateConstraintController] Duplicate constraint title | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }
      if (result.message === "No changes detected") {
        logWithTime(`⚠️ [updateConstraintController] No changes detected | ${getLogIdentifiers(req)}`);
        return sendConstraintUpdatedSuccess(res, result.constraint);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [updateConstraintController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }
      logWithTime(`❌ [updateConstraintController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    if (result.message === "No changes detected") {
      logWithTime(`⚠️ [updateConstraintController] No changes detected | ${getLogIdentifiers(req)}`);
      return res.status(OK).json({
        success: true,
        message: "No changes detected. Constraint remains unchanged.",
        constraint: result.constraint
      });
    }

    logWithTime(`✅ [updateConstraintController] Constraint updated successfully | ${getLogIdentifiers(req)}`);
    return sendConstraintUpdatedSuccess(res, result.constraint);

  } catch (error) {
    logWithTime(`❌ [updateConstraintController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateConstraintController };
