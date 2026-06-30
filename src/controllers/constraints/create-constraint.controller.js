// controllers/constraints/create-constraint.controller.js

const { createConstraintService } = require("@services/constraints/create-constraint.service");
const { sendConstraintCreatedSuccess } = require("@/responses/success/constraint.response");

const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

const createConstraintController = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const createdBy = req.admin.adminId;

    const inception = req.inception;
    const project = req.project;

    const result = await createConstraintService({
      inception,
      projectId: project._id.toString(),
      title,
      description: description || null,
      type,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Constraint with this title already exists in this project.") {
        logWithTime(`❌ [createConstraintController] Duplicate constraint title | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [createConstraintController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }
      logWithTime(`❌ [createConstraintController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [createConstraintController] Constraint created successfully | ${getLogIdentifiers(req)}`);
    return sendConstraintCreatedSuccess(res, result.constraint);

  } catch (error) {
    logWithTime(`❌ [createConstraintController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createConstraintController };
