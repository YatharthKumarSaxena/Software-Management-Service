// controllers/requirements/list-requirements.controller.js

const { requirementServices } = require("@services/requirements");
const {
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementsListSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { UserTypes } = require("@configs/enums.config");

/**
 * GET /projects/:projectId/elicitations/:elicitationId/requirements
 * List requirements with pagination and optional status filtering.
 */
const listRequirementsController = async (req, res) => {
  try {
    const { elicitationId } = req.params;
    const { limit = 10, skip = 0, sortBy = '-createdAt', status } = req.query;

    logWithTime(
      `📍 [listRequirementsController] Listing requirements for elicitation: ${elicitationId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const userId = user?.adminId || user?.clientId;
    const userType = req.admin ? UserTypes.USER : UserTypes.CLIENT;

    // ── Call service ──────────────────────────────────────────────────
    const result = await requirementServices.listRequirementsService({
      elicitationId,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      sortBy,
      status,
      userType,
      userId
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [listRequirementsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [listRequirementsController] Requirements listed successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementsListSuccess(res, result.requirements, result.pagination);

  } catch (error) {
    logWithTime(`❌ [listRequirementsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listRequirementsController };
