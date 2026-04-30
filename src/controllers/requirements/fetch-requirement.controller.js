// controllers/requirements/fetch-requirement.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementFetchSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { UserTypes } = require("@configs/enums.config");

/**
 * GET /projects/:projectId/elicitations/:elicitationId/requirements/:requirementId
 * Fetch a single requirement with metadata.
 */
const fetchRequirementController = async (req, res) => {
  try {
    logWithTime(
      `📍 [fetchRequirementController] Filtering requirement | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const userId = user?.adminId || user?.clientId;
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;
    const requirement = req.resource; // Requirement loaded by middleware

    // ── Call service (only filters, no refetch) ───────────────────────
    const result = await requirementServices.fetchRequirementService({
      requirement,
      userType,
      userId
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [fetchRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [fetchRequirementController] Requirement filtered successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementFetchSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [fetchRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchRequirementController };
