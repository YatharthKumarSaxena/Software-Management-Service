// controllers/meetings/create-auto-meeting.controller.js

const { createAutoMeetingService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwConflictError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendMeetingAutoCreatedSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT, SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT } = require("@configs/http-status.config");

/**
 * POST /meetings/create-auto/:entityType/:projectId
 * Automatically creates a meeting and generates a provider link (Google Meet, Teams, or Zoom).
 *
 * EXPECTS from middleware (req):
 * - entityType: Entity type (from DB_COLLECTIONS)
 * - projectId: Project ID
 * - project: Project document
 * - parentEntity: Parent entity document
 */
const createAutoMeetingController = async (req, res) => {
  try {
    const {
      title,
      description,
      agenda,
      facilitatorId,
      meetingGroup,
      platform,
      isMeetingPasswordRequired,
      scheduledAt,
      expectedDuration
    } = req.body || {};

    const entityType = req.params.entityType;
    const { project, parentEntity } = req;
    const createdBy = req.admin.adminId;

    logWithTime(
      `📍 [createAutoMeetingController] Creating auto meeting on platform: ${platform || "GOOGLE_MEET"} | ${getLogIdentifiers(req)}`
    );

    // Call service (meetingLink and meetingPassword are not asked from the user)
    const result = await createAutoMeetingService({
      parentEntity,
      entityType,
      project,
      title,
      description,
      agenda,
      facilitatorId,
      meetingGroup,
      platform,
      isMeetingPasswordRequired,
      scheduledAt,
      expectedDuration,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      logWithTime(
        `❌ [createAutoMeetingController] Error | Message: ${result.message}, ErrorCode: ${result.errorCode} | ${getLogIdentifiers(req)}`
      );

      if (result.errorCode === GATEWAY_TIMEOUT || result.isTimeout) {
        return res.status(GATEWAY_TIMEOUT).json({
          success: false,
          type: "ProviderTimeout",
          message: result.message,
          action: result.action || "RETRY_OR_MANUAL_LINK",
          fallbackAvailable: true,
          details: result.details
        });
      }

      if (result.errorCode === SERVICE_UNAVAILABLE || result.isUnavailable) {
        return res.status(SERVICE_UNAVAILABLE).json({
          success: false,
          type: "ProviderUnavailable",
          message: result.message,
          action: result.action || "RETRY_OR_MANUAL_LINK",
          fallbackAvailable: true,
          details: result.details
        });
      }

      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message, result.details);
      }

      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message, result.details);
      }

      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [createAutoMeetingController] Meeting automatically created successfully | ${getLogIdentifiers(req)}`);

    const meta = {};
    if (result.passwordNote) {
      meta.passwordNote = result.passwordNote;
    }

    return sendMeetingAutoCreatedSuccess(res, result.meeting, meta);

  } catch (error) {
    logWithTime(`❌ [createAutoMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createAutoMeetingController };
