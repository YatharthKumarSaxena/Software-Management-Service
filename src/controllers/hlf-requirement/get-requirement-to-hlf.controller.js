// controllers/requirements/get-requirement-to-hlf.controller.js

const { getRequirementToHlfService } = require("@/services/hlf-requirement/get-requirement-to-hlf.service");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendMappingFetchSuccess } = require("@/responses/success/hlf-requirement-mapping.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { UserTypes } = require("@configs/enums.config");

/**
 * GET /projects/:projectId/requirements-hlf/:mappingId
 * Fetch a single requirement-HLF mapping.
 * Both clients and admins can access this.
 */
const getRequirementToHlfController = async (req, res) => {
  try {
    logWithTime(
      `📍 [getRequirementToHlfController] Filtering mapping | ${getLogIdentifiers(req)}`
    );

    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;
    const mapping = req.mapping; // Mapping loaded by middleware

    // ── Call service (only filters, no refetch) ───────────────────────
    const result = await getRequirementToHlfService({
      mapping,
      userType
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [getRequirementToHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [getRequirementToHlfController] Mapping fetched successfully | ${getLogIdentifiers(req)}`);
    return sendMappingFetchSuccess(res, result.mapping);

  } catch (error) {
    logWithTime(`❌ [getRequirementToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getRequirementToHlfController };
