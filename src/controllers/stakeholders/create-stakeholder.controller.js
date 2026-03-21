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

    const { role, orgId } = req.body;
    const createdBy = req.admin.adminId;

    const project = req.project;
    const user = req.stakeholderUser.entity

    // ── Call service ──────────────────────────────────────
    const result = await createStakeholderService({
      project,
      user,
      role,
      organizationId: orgId || null,
      createdBy,
      auditContext: {
        user: req.admin,
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

      if (result.message === "organizationId is required for multi-organization projects.") {
        logWithTime(`❌ [createStakeholderController] Missing organizationId for multi-org project | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "The specified organization does not belong to the client.") {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "The specified organization is not associated with this project.") {
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

      if (result.message === "Your organisation is not associated with this project.") {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Individual projects can only have one client") {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Client does not belong to the required organisation.") {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Invalid organizationId format. Must be a valid MongoDB ObjectId string.") {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Client organisation is not associated with this project.") {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
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
