// controllers/scopes/update-scope.controller.js

const { updateScopeService } = require("@services/scopes/update-scope.service");
const { sendScopeUpdatedSuccess } = require("@/responses/success/scope.response");

const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
  throwConflictError
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { OK } = require("@/configs/http-status.config");

const updateScopeController = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const updatedBy = req.admin.adminId;

    const scope = req.scope;
    const inception = req.inception;
    const project = req.project;

    // ── Call service ──────────────────────────────────────
    const result = await updateScopeService({
      scope,
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
      if (result.message === "Scope with this title already exists in this inception.") {
        logWithTime(`❌ [updateScopeController] Duplicate scope title | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }
      if (result.message === "No changes detected") {
        logWithTime(`⚠️ [updateScopeController] No changes detected | ${getLogIdentifiers(req)}`);
        return sendScopeUpdatedSuccess(res, result.scope);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [updateScopeController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [updateScopeController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    if (result.message === "No changes detected") {
      logWithTime(`⚠️ [updateScopeController] No changes detected | ${getLogIdentifiers(req)}`);
      return res.status(OK).json({
        success: true,
        message: "No changes detected. Scope remains unchanged.",
        scope: result.scope
      });
    }

    logWithTime(`✅ [updateScopeController] Scope updated successfully | ${getLogIdentifiers(req)}`);
    return sendScopeUpdatedSuccess(res, result.scope);

  } catch (error) {
    logWithTime(`❌ [updateScopeController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateScopeController };
