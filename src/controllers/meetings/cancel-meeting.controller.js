// controllers/meetings/cancel-meeting.controller.js

const { cancelMeetingService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendMeetingCancelledSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST } = require("@configs/http-status.config");

/**
 * DELETE /meetings/:meetingId
 * Cancel a meeting (only allowed if status is DRAFT)
 */
const cancelMeetingController = async (req, res) => {
  try {
    const { cancelReason, cancelDescription } = req.body;
    const { meeting, project } = req;

    logWithTime(
      `📍 [cancelMeetingController] Cancelling meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await cancelMeetingService(
      meeting,
      project,
      {
        cancelReason,
        cancelDescription,
        cancelledBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [cancelMeetingController] Error occurred | Message: ${result.message}, ErrorCode: ${result.errorCode} | ${getLogIdentifiers(req)}`);
      
      // Use errorCode to determine which error handler to call
      if (result.errorCode === BAD_REQUEST) {
        logWithTime(`⚠️ [cancelMeetingController] Returning BAD_REQUEST (400) error: ${result.message}`);
        return throwBadRequestError(res, result.message);
      }
      
      logWithTime(`⚠️ [cancelMeetingController] Returning INTERNAL_ERROR: ${result.message}`);
      return throwSpecificInternalServerError(res, new Error(result.message));
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(`✅ [cancelMeetingController] Meeting cancelled successfully | ${getLogIdentifiers(req)}`);
    return sendMeetingCancelledSuccess(res, result.meeting);

  } catch (error) {
    logWithTime(`❌ [cancelMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { cancelMeetingController };
