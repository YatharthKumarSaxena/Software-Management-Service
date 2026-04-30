// controllers/requirements/update-requirement-to-hlf.controller.js

const { updateRequirementToHlfService } = require("@/services/hlf-requirement/update-requirement-to-hlf.service");
const {
  throwBadRequestError,
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendMappingUpdateSuccess } = require("@/responses/success/hlf-requirement-mapping.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * PUT /requirements/:mappingId/update-mapping
 * Update a requirement-to-HLF mapping (only LINKED mappings)
 */
const updateRequirementToHlfController = async (req, res) => {
  try {
    const mappingId = req.mapping._id;
    
    const { relationshipNotes, relationType } = req.body;

    logWithTime(
      `📍 [updateRequirementToHlfController] Updating mapping: ${mappingId} | ${getLogIdentifiers(req)}`
    );

    const user = req?.admin || req?.client;
    const updatedBy = user?.adminId || user?.clientId;

    // ── Call service ──────────────────────────────────────────────────
    const result = await updateRequirementToHlfService({
      mappingId,
      relationshipNotes,
      relationType,
      updatedBy,
      auditContext: {
        user,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [updateRequirementToHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      // Route error to appropriate handler based on errorCode
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      
      // Fallback for unknown error codes
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [updateRequirementToHlfController] Mapping updated successfully | ${getLogIdentifiers(req)}`);
    return sendMappingUpdateSuccess(res, result.mapping, result.message);

  } catch (error) {
    logWithTime(`❌ [updateRequirementToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateRequirementToHlfController };
