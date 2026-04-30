// controllers/requirements/unlink-requirement.controller.js

const { unlinkRequirementService } = require("@services/requirements/unlink-requirement.service");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementLinkedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, BAD_REQUEST, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/unlink
 * Unlink a requirement from another requirement or from a high-level feature.
 * Removes the linked relationship without deleting either requirement.
 */
const unlinkRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { linkedRequirementIds, parentHlfId } = req.body;

    logWithTime(
      `📍 [unlinkRequirementController] Unlinking requirement: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const unlinkedBy = user?.adminId || user?.clientId;

    // ── Call service ──────────────────────────────────────────────────
    const result = await unlinkRequirementService({
      requirementId,
      linkedRequirementIds,
      parentHlfId,
      unlinkedBy,
      auditContext: {
        user,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [unlinkRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      // Route error to appropriate handler based on errorCode
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      
      if (result.errorCode === NOT_FOUND) {
        return throwDBResourceNotFoundError(res, result.message);
      }
      
      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message, "Try unlinking from a different requirement or check existing links");
      }

      if (result.errorCode === INTERNAL_ERROR) {
        return throwSpecificInternalServerError(res, result.message);
      }
      
      // Fallback for unknown error codes
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [unlinkRequirementController] Requirement unlinked successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementLinkedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [unlinkRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { unlinkRequirementController };
