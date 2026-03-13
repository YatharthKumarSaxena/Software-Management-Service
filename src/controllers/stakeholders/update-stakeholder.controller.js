// controllers/stakeholders/update-stakeholder.controller.js

const { updateStakeholderService } = require("@services/stakeholders/update-stakeholder.service");
const { sendStakeholderUpdatedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Update Stakeholder
 *
 * @route  PATCH /software-management-service/api/v1/admin/update-stakeholder/:stakeholderId
 * @access Private – Admin (CEO / Business Analyst / Manager)
 *
 * @param {string} stakeholderId - MongoDB ObjectId (from URL param)
 * @body  {string} role          - New role to assign
 *
 * req.stakeholder is pre-populated by fetchStakeholderMiddleware.
 * role-guard middleware has validated the role type.
 * No update reason is required.
 *
 * @returns {200} Stakeholder updated
 * @returns {400} Invalid or blocked operation
 * @returns {500} Internal server error
 */
const updateStakeholderController = async (req, res) => {
  try {
    const { role } = req.body;
    const updatedBy  = req.admin.adminId;
    const stakeholder = req.foundStakeholder;
    const project = req.project;

    const result = await updateStakeholderService(stakeholder, project, {
      role,
      updatedBy,
      auditContext: {
        admin:     req.admin,
        device:    req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message?.startsWith("Cannot update a stakeholder on a")) {
        logWithTime(`❌ [updateStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [updateStakeholderController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [updateStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [updateStakeholderController] Stakeholder updated successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholderUpdatedSuccess(res, result.stakeholder);
  } catch (error) {
    logWithTime(`❌ [updateStakeholderController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateStakeholderController };
