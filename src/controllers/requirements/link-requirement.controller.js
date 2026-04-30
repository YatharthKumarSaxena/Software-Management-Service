// controllers/requirements/link-requirement.controller.js

const { linkRequirementService } = require("@services/requirements/link-requirement.service");
const {
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementLinkedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId/link
 * Link a requirement to other requirements with specified relation types.
 * Optionally set a parent high-level feature.
 */
const linkRequirementController = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { linkedRequirementIds } = req.body;

    logWithTime(
      `📍 [linkRequirementController] Linking requirement: ${requirementId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const linkedBy = user?.adminId || user?.clientId;

    // ── Call service ──────────────────────────────────────────────────
    const result = await linkRequirementService({
      requirementId,
      linkedRequirementIds,
      auditContext: {
        user,
        device: req.device,
        requestId: req.requestId
      },
      linkedBy,
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [linkRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [linkRequirementController] Requirement linked successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementLinkedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [linkRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { linkRequirementController };
