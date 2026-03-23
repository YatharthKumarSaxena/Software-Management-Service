// controllers/scopes/delete-scope.controller.js

const { deleteScopeService } = require("@services/scopes/delete-scope.service");
const { sendScopeDeletedSuccess } = require("@/responses/success/scope.response");

const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { PriorityLevels } = require("@/configs/enums.config");

const deleteScopeController = async (req, res) => {
  try {
    const { deletionReasonDescription } = req.body;
    const deletedBy = req.admin.adminId;

    const scope = req.scope;
    const inception = req.inception;
    const project = req.project;

    // ── Check if deletion reason is required based on project criticality ─────
    if (project.projectCriticality === PriorityLevels.HIGH && !deletionReasonDescription) {
      logWithTime(`❌ [deleteScopeController] Missing deletion reason for HIGH criticality project | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(
        res,
        "Deletion reason is required",
        "This project has HIGH criticality. Deletion reason description is mandatory."
      );
    }

    // ── Call service ──────────────────────────────────────
    const result = await deleteScopeService({
      scope,
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
        logWithTime(`❌ [deleteScopeController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [deleteScopeController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [deleteScopeController] Scope deleted successfully | ${getLogIdentifiers(req)}`);
    return sendScopeDeletedSuccess(res);

  } catch (error) {
    logWithTime(`❌ [deleteScopeController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteScopeController };
