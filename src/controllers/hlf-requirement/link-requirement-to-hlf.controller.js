// controllers/requirements/link-requirement-to-hlf.controller.js

const { linkRequirementToHlfService } = require("@/services/hlf-requirement/link-requirement-to-hlf.service");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementFeatureMappedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, BAD_REQUEST, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/link-to-hlf
 * Link a requirement to a high-level feature with contribution types
 */
const linkRequirementToHlfController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { highLevelFeatureId, contributionTypes, relationType, relationshipNotes } = req.body;

    logWithTime(
      `📍 [linkRequirementToHlfController] Linking requirement to HLF: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const linkedBy = user?.adminId || user?.clientId;

    // ── Call service ──────────────────────────────────────────────────
    const result = await linkRequirementToHlfService({
      requirementId,
      highLevelFeatureId,
      contributionTypes,
      relationType,
      relationshipNotes,
      linkedBy,
      auditContext: {
        user,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [linkRequirementToHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      // Route error to appropriate handler based on errorCode
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      
      if (result.errorCode === NOT_FOUND) {
        return throwDBResourceNotFoundError(res, result.message);
      }
      
      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message, "Try mapping to a different HLF or check existing mappings");
      }

      if (result.errorCode === INTERNAL_ERROR) {
        return throwSpecificInternalServerError(res, result.message);
      }
      
      // Fallback for unknown error codes
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [linkRequirementToHlfController] Requirement linked to HLF successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementFeatureMappedSuccess(res, result.mapping);

  } catch (error) {
    logWithTime(`❌ [linkRequirementToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { linkRequirementToHlfController };
