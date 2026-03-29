// controllers/meetings/create-meeting.controller.js

const { createMeetingService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwConflictError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendMeetingCreatedSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

/**
 * POST /meetings
 * Create a new meeting for an entity (Elicitation or Negotiation)
 * 
 * EXPECTS from middleware (req):
 * - entityType: Entity type (from DB_COLLECTIONS)
 * - projectId: Project ID
 * - project: Project document for version control
 * - parentEntity: The parent entity document (Elicitation or Negotiation)
 */
const createMeetingController = async (req, res) => {
  try {
    const { title, facilitatorId, description, meetingGroup, platform } = req.body;
    const entityType = req.params.entityType;
    const { project, parentEntity } = req;
    const createdBy = req.admin.adminId;

    logWithTime(
      `📍 [createMeetingController] Creating meeting | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await createMeetingService({
      parentEntity,
      entityType,
      project,
      title,
      facilitatorId,
      description,
      meetingGroup,
      platform,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [createMeetingController] Error occurred | Message: ${result.message}, ErrorCode: ${result.errorCode}, Details: ${result.details} | ${getLogIdentifiers(req)}`);
      
      // Use errorCode to determine which error handler to call
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [createMeetingController] Returning CONFLICT (409) error: ${result.message}`);
        return throwConflictError(res, result.message, result.details);
      }
      
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`⚠️ [createMeetingController] Returning BAD_REQUEST (400) error: ${result.message}`);
        return throwBadRequestError(res, result.message, result.details);
      }
      
      logWithTime(`⚠️ [createMeetingController] Returning INTERNAL_ERROR: ${result.message}`);
      return throwSpecificInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(`✅ [createMeetingController] Meeting created successfully | ${getLogIdentifiers(req)}`);
    return sendMeetingCreatedSuccess(res, result.meeting);

  } catch (error) {
    logWithTime(`❌ [createMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createMeetingController };
