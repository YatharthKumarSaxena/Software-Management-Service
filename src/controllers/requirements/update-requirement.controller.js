// controllers/requirements/update-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwConflictError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { sendRequirementUpdatedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, FORBIDDEN } = require("@configs/http-status.config");
const { TotalTypes } = require("@/configs/enums.config");
/**
 * PUT /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId
 * Update a requirement (only in DRAFT status).
 */
const updateRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { project, elicitation, elaboration, negotiation } = req;
    const { title, description, priority, type, proposedDate, parentHlfId, phase, relationType, relationshipNotes } = req.body;

    logWithTime(
      `📍 [updateRequirementController] Updating requirement: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const userId = user?.adminId || user?.clientId;
    const userType = req.admin ? TotalTypes.ADMIN : TotalTypes.CLIENT;

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.updateRequirementService({
      requirementId,
      project,
      phase,
      elicitation,
      elaboration,
      negotiation,
      updateData: { title, description, priority, type, proposedDate, parentHlfId, relationType, relationshipNotes },
      updatedBy: userId,
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
          `❌ [updateRequirementController] ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwConflictError(res, result.message, "Cannot update requirement in current state");
      }
      if (result.errorCode === FORBIDDEN) {
        logWithTime(
          `❌ [updateRequirementController] Access denied: ${result.message} | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(res, result.message);
      }
      logWithTime(`❌ [updateRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [updateRequirementController] Requirement updated successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementUpdatedSuccess(res, result.requirement, result.message);

  } catch (error) {
    logWithTime(`❌ [updateRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateRequirementController };
