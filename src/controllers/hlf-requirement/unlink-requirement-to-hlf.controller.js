// controllers/requirements/unlink-requirement-to-hlf.controller.js

const { unlinkRequirementToHlfService } = require("@/services/hlf-requirement/unlink-requirement-to-hlf.service");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendRequirementFeatureUnmappedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, CONFLICT, BAD_REQUEST } = require("@configs/http-status.config");

/**
 * DELETE /requirements/:mappingId/unlink
 * Unlink a requirement from a high-level feature (change status to UNLINKED)
 */
const unlinkRequirementToHlfController = async (req, res) => {
  try {
    const mappingId = req.mapping._id;
    const { unlinkReason, unlinkDescription } = req.body;

    logWithTime(
      `📍 [unlinkRequirementToHlfController] Unlinking mapping: ${mappingId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const unlinkedBy = user?.adminId || user?.clientId;

    // ── Call service ──────────────────────────────────────────────────
    const result = await unlinkRequirementToHlfService({
      mappingId,
      unlinkReason,
      unlinkDescription,
      unlinkedBy,
      auditContext: {
        user,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [unlinkRequirementToHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      // Route error to appropriate handler based on errorCode
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      
      if (result.errorCode === NOT_FOUND) {
        return throwDBResourceNotFoundError(res, result.message);
      }
      
      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message, "Requirement is already unlinked from this HLF");
      }

      // Fallback for unknown error codes
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [unlinkRequirementToHlfController] Requirement unlinked from HLF successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementFeatureUnmappedSuccess(res, result.mapping);

  } catch (error) {
    logWithTime(`❌ [unlinkRequirementToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { unlinkRequirementToHlfController };
