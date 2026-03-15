// controllers/stakeholders/create-stakeholder.controller.js

const { createStakeholderService } = require("@services/stakeholders/create-stakeholder.service");
const { sendStakeholderCreatedSuccess } = require("@/responses/success/stakeholder.response");

const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");


const createStakeholderController = async (req, res) => {
  try {

    const { userId, role, orgId } = req.body;
    const createdBy = req.admin.adminId;

    const project = req.project;

    // ── Call service ──────────────────────────────────────
    const result = await createStakeholderService({
      project,
      userId,
      role,
      organizationId: orgId || null,
      createdBy,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });


    if (!result.success) {

      if (result.message === "Stakeholder already exists for this project") {
        logWithTime(`❌ [createStakeholderController] Stakeholder already exists | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }

      if (result.message?.startsWith("Cannot add a stakeholder")) {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Individual projects can only have one stakeholder") {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [createStakeholderController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }


    logWithTime(`✅ [createStakeholderController] Stakeholder created successfully | ${getLogIdentifiers(req)}`);

    return sendStakeholderCreatedSuccess(res, result.stakeholder);

  } catch (error) {
    logWithTime(`❌ [createStakeholderController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createStakeholderController };
