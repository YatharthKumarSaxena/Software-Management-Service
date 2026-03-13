// controllers/stakeholders/delete-stakeholder.controller.js

const { deleteStakeholderService } = require("@services/stakeholders/delete-stakeholder.service");
const { sendStakeholderDeletedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Delete Stakeholder (soft-delete)
 *
 * @route  DELETE /software-management-service/api/v1/admin/delete-stakeholder/:stakeholderId
 * @access Private – Admin (CEO / Manager)
 *
 * @param {string} stakeholderId          - MongoDB ObjectId (from URL param)
 * @body  {string} deletionReasonType     - Required enum value
 * @body  {string} [deletionReasonDescription] - Optional free-text
 *
 * req.stakeholder is pre-populated by fetchStakeholderMiddleware.
 *
 * @returns {200} Stakeholder deleted
 * @returns {400} Already deleted or invalid
 * @returns {500} Internal server error
 */
const deleteStakeholderController = async (req, res) => {
  try {
    const { deletionReasonType, deletionReasonDescription } = req.body;
    const deletedBy  = req.admin.adminId;
    const project = req.project;
    const stakeholder = req.foundStakeholder;

    const result = await deleteStakeholderService(stakeholder, project, {
      deletedBy,
      deletionReasonType,
      deletionReasonDescription,
      auditContext: {
        admin:     req.admin,
        device:    req.device,
        requestId: req.requestId,
      }
    });

    if (!result.success) {
      if (result.message === "Stakeholders cannot be removed from an individual project") {
        logWithTime(`❌ [deleteStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [deleteStakeholderController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [deleteStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [deleteStakeholderController] Stakeholder deleted successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholderDeletedSuccess(res);
  } catch (error) {
    logWithTime(`❌ [deleteStakeholderController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteStakeholderController };
