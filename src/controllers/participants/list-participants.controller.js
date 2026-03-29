// controllers/participants/list-participants.controller.js

const { listParticipantsService } = require("@services/participants");
const {
  throwInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendParticipantsListSuccess } = require("@/responses/success/participant.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { filterParticipantDataByUserType } = require("@utils/data-filter.util");

/**
 * GET /api/v1/participants/list/:entityType/:meetingId
 * Fetch all active (non-deleted) participants from a meeting
 * 
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.adminId: Admin ID if user is admin (for data filtering)
 */
const listParticipantsController = async (req, res) => {
  try {
    const { foundMeeting, admin, adminId } = req;
    const meeting = foundMeeting;

    logWithTime(
      `📍 [listParticipantsController] Fetching all participants for meeting ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── 1. Call service to fetch participants ────────────────────────────
    const result = await listParticipantsService(meeting);

    if (!result.success) {
      logWithTime(
        `[listParticipantsController] ❌ Error: ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwInternalServerError(res, result.message);
    }

    // ── 2. Filter participant data based on user type ──────────────────────
    const isAdmin = !!adminId;
    const filteredParticipants = filterParticipantDataByUserType(
      result.participants,
      isAdmin
    );

    logWithTime(
      `✅ [listParticipantsController] Found ${result.count} participant(s) | ${getLogIdentifiers(req)}`
    );

    return sendParticipantsListSuccess(res, filteredParticipants, result.count);

  } catch (error) {
    logWithTime(
      `❌ [listParticipantsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { listParticipantsController };
