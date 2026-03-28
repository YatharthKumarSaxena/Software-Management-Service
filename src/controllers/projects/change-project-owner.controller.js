// controllers/projects/change-project-owner.controller.js

const { changeProjectOwnerService } = require("@services/projects/change-project-owner.service");
const { sendProjectUpdatedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwConflictError,
  throwDBResourceNotFoundError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { PriorityLevels } = require("@configs/enums.config");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

/**
 * Controller: Change Project Owner
 *
 * @route  PATCH /software-management-service/api/v1/admin/change-owner/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId                 - MongoDB ObjectId of the project
 * @body   {string} userId                    - USR-prefixed ID of new owner
 * @body   {string} changeOwnerReasonType     - Enum: why the owner is being changed
* @body   {string} [ownerChangeReasonDescription] - Optional; mandatory if criticality = CRITICAL
* @body   {string} [prevOwnerRole] - Optional: new role for previous owner. Cannot be 'owner' type. Defaults to 'analyst'
 *
 * @returns {200} Project owner changed successfully
 * @returns {400} Bad request / validation error / mandatory description missing
 * @returns {404} Project or user not found
 * @returns {409} Conflict (trying to set same owner)
 * @returns {500} Internal server error
 */

const changeProjectOwnerController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware injected
    const { userId, changeOwnerReasonType, ownerChangeReasonDescription, prevOwnerRole } = req.body;
    const changedBy = req.admin.adminId;

    // ── Validate conditional description requirement ───────────────────────
    if (project.projectCriticality === PriorityLevels.CRITICAL && !ownerChangeReasonDescription) {
      logWithTime(
        `❌ [changeProjectOwnerController] Description is mandatory for CRITICAL projects | ${getLogIdentifiers(req)}`
      );
      return throwBadRequestError(
        res,
        "Description is mandatory for CRITICAL projects",
        "When project criticality is CRITICAL, description field is required"
      );
    }

    const result = await changeProjectOwnerService(project, {
      userId,
      changeOwnerReasonType,
      ownerChangeReasonDescription: ownerChangeReasonDescription || null,
      changedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
      prevOwnerRole: prevOwnerRole || undefined,
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(`❌ [changeProjectOwnerController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [changeProjectOwnerController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, result.message);
      }
      logWithTime(`❌ [changeProjectOwnerController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [changeProjectOwnerController] Project owner changed successfully | ${getLogIdentifiers(req)}`);
    return sendProjectUpdatedSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [changeProjectOwnerController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { changeProjectOwnerController };
