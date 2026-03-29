// controllers/meetings/get-meeting.controller.js

const { getMeetingService } = require("@services/meetings");
const {
  throwInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendMeetingFetchedSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * GET /meetings/:meetingId
 * Fetch a single meeting
 */

const getMeetingController = async (req, res) => {
  try {
    const { meeting } = req;
    const user = req?.admin || req?.client; // Depending on auth, one of these will be populated

    logWithTime(
      `📍 [getMeetingController] Fetching meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await getMeetingService(meeting, user);

    if (!result.success) {
      logWithTime(`❌ [getMeetingController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, result.message);
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(`✅ [getMeetingController] Meeting fetched successfully | ${getLogIdentifiers(req)}`);
    return sendMeetingFetchedSuccess(res, result.meeting);

  } catch (error) {
    logWithTime(`❌ [getMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getMeetingController };
