// controllers/meetings/regenerate-meeting-link.controller.js

const { regenerateMeetingLinkService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwConflictError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { sendMeetingLinkRegeneratedSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT, SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT } = require("@configs/http-status.config");

/**
 * PATCH/POST /meetings/regenerate-link/:entityType/:meetingId
 * Regenerates the provider meeting link and credentials for an existing meeting.
 *
 * EXPECTS from middleware (req):
 * - foundMeeting: Meeting document fetched from DB
 * - project: Project document
 * - admin: User context
 */
const regenerateMeetingLinkController = async (req, res) => {
  try {
    const meeting = req.foundMeeting || req.meeting;
    const project = req.project;
    const updatedBy = req.admin.adminId;
    const { isMeetingPasswordRequired } = req.body || {};

    logWithTime(
      `📍 [regenerateMeetingLinkController] Regenerating meeting link for meeting: ${meeting?._id} | ${getLogIdentifiers(req)}`
    );

    const result = await regenerateMeetingLinkService(
      meeting,
      project,
      {
        isMeetingPasswordRequired,
        updatedBy,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    if (!result.success) {
      logWithTime(
        `❌ [regenerateMeetingLinkController] Error | Message: ${result.message}, ErrorCode: ${result.errorCode} | ${getLogIdentifiers(req)}`
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

    logWithTime(`✅ [regenerateMeetingLinkController] Meeting link regenerated successfully | ${getLogIdentifiers(req)}`);

    const meta = {};
    if (result.passwordNote) {
      meta.passwordNote = result.passwordNote;
    }

    return sendMeetingLinkRegeneratedSuccess(res, result.meeting, meta);

  } catch (error) {
    logWithTime(`❌ [regenerateMeetingLinkController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { regenerateMeetingLinkController };
