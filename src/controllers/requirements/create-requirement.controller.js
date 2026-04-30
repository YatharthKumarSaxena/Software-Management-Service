// controllers/requirements/create-requirement.controller.js

const { createRequirementService } = require("@services/requirements/create-requirement.service");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendRequirementCreatedSuccess } = require("@/responses/success/requirement.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { RequirementSources, RequirementTypes } = require("@configs/enums.config");
const { BAD_REQUEST, NOT_FOUND, CONFLICT } = require("@configs/http-status.config");

/**
 * POST /projects/:projectId/elicitations/:elicitationId/requirements
 * Create a new requirement for an elicitation in the current workflow mode.
 */
const createRequirementController = async (req, res) => {
  try {
    const { project, elicitation, elaboration } = req;
    const { title, description, priority, type, proposedDate, parentHlfId, relationType, relationshipNotes, phase } = req.body;

    logWithTime(
      `📍 [createRequirementController] Creating requirement in project: ${project?._id} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const createdBy = user?.adminId || user?.clientId;

    const Type = type || RequirementTypes.FUNCTIONAL;

    // ── Call service ──────────────────────────────────────────────────
    const result = await createRequirementService({
      project,
      elicitation,
      elaboration,
      phase,
      title,
      description,
      priority,
      type: Type,
      proposedDate,
      source: RequirementSources.MANUAL,
      createdBy,
      parentHlfId,
      relationType,
      relationshipNotes,
      auditContext: {
        user,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [createRequirementController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      // Route error to appropriate handler based on errorCode
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.error || result.message, { details: result.error });
      }
      
      if (result.errorCode === NOT_FOUND) {
        return throwDBResourceNotFoundError(res, result.error || result.message);
      }

      if (result.errorCode === CONFLICT) {
        return throwBadRequestError(res, result.message, { details: "Requirement mapping conflict" });
      }
      
      // Fallback for unknown error codes
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [createRequirementController] Requirement created successfully | ${getLogIdentifiers(req)}`);
    return sendRequirementCreatedSuccess(res, result.requirement);

  } catch (error) {
    logWithTime(`❌ [createRequirementController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createRequirementController };
