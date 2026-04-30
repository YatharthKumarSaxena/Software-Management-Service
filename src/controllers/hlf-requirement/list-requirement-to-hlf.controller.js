// controllers/requirements/list-requirement-to-hlf.controller.js

const { listRequirementToHlfService } = require("@/services/hlf-requirement/list-requirement-to-hlf.service");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendMappingListSuccess } = require("@/responses/success/hlf-requirement-mapping.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { UserTypes } = require("@configs/enums.config");

/**
 * GET /projects/:projectId/requirements-hlf
 * List requirement-HLF mappings with optional filtering.
 * Query params:
 * - featureId: Filter by HLF
 * - requirementId: Filter by requirement
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * 
 * Both clients and admins can access this.
 */
const listRequirementToHlfController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { featureId, requirementId, page = 1, limit = 10 } = req.query;

    logWithTime(
      `📍 [listRequirementToHlfController] Listing requirement-HLF mappings | Page: ${page}, Limit: ${limit} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const userId = user?.adminId || user?.clientId;
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;

    // ── Call service ──────────────────────────────────────────────────
    const result = await listRequirementToHlfService({
      projectId,
      featureId,
      requirementId,
      page: parseInt(page),
      limit: parseInt(limit),
      userType,
      userId
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [listRequirementToHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [listRequirementToHlfController] Listed ${result.mappings.length} mappings | ${getLogIdentifiers(req)}`);
    return sendMappingListSuccess(res, result.mappings, result.pagination);

  } catch (error) {
    logWithTime(`❌ [listRequirementToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listRequirementToHlfController };
