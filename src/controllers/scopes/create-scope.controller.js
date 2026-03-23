// controllers/scopes/create-scope.controller.js

const { createScopeService } = require("@services/scopes/create-scope.service");
const { sendScopeCreatedSuccess } = require("@/responses/success/scope.response");

const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

const createScopeController = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const createdBy = req.admin.adminId;

    const inception = req.inception;

    // ── Call service ──────────────────────────────────────
    const result = await createScopeService({
      inception,
      title,
      description: description || null,
      type: type || null,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Scope with this title already exists in this inception.") {
        logWithTime(`❌ [createScopeController] Duplicate scope title | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [createScopeController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [createScopeController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [createScopeController] Scope created successfully | ${getLogIdentifiers(req)}`);
    return sendScopeCreatedSuccess(res, result.scope);

  } catch (error) {
    logWithTime(`❌ [createScopeController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createScopeController };
