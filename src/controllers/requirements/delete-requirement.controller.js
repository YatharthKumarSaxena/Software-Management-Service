// controllers/requirements/delete-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
  throwConflictError
} = require("@/responses/common/error-handler.response");
const { sendRequirementDeletedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN } = require("@configs/http-status.config");
const { TotalTypes } = require("@/configs/enums.config");

/**
 * DELETE /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId
 * Delete a requirement (soft-delete with audit trail). Only allowed in Elicitation and Elaboration phases.
 */
const deleteRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { project, elicitation, elaboration } = req;
    const { deletionReasonType, deletionReasonDescription, phase } = req.body;

    logWithTime(
      `📍 [deleteRequirementController] Deleting requirement: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const userId = user?.adminId || user?.clientId;
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.deleteRequirementService({
      requirementId,
      project,
      phase,
      elicitation,
      elaboration,
      deletionReasonType,
      deletionReasonDescription,
      deletedBy: userId,
      userType,
      auditContext: {
        user: user,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(
          `❌ [deleteRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot delete requirement in current state");
      }
      if (result.errorCode === FORBIDDEN) {
        logWithTime(
          `❌ [deleteRequirementController] Access denied: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      logWithTime(`❌ [deleteRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [deleteRequirementController] Requirement deleted successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementDeletedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [deleteRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteRequirementController };
