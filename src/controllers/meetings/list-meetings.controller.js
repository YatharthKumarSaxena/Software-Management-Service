// controllers/meetings/list-meetings.controller.js

const { listMeetingsService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendMeetingsListSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * GET /meetings
 * List meetings for the authenticated user (only as participant)
 */
const listMeetingsController = async (req, res) => {
  try {
    const { entityId, entityType, page, limit } = req.query;
    const user = req?.admin || req?.client; // Depending on auth, one of these will be populated

    logWithTime(
      `📍 [listMeetingsController] Listing meetings for user | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await listMeetingsService({
      user,
      entityId: entityId || undefined,
      entityType: entityType || undefined,
      page: page || 1,
      limit: limit || 10
    });

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [listMeetingsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ────────────────────────────────────────
    // (Filtering is already done in the service layer)
    logWithTime(`✅ [listMeetingsController] Found ${result.meetings.length} meetings | ${getLogIdentifiers(req)}`);
    return sendMeetingsListSuccess(res, result.meetings, result.pagination);

  } catch (error) {
    logWithTime(`❌ [listMeetingsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listMeetingsController };
