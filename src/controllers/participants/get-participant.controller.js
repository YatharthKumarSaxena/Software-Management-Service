// controllers/participants/get-participant.controller.js

const { getParticipantService } = require("@services/participants");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwNotFoundError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendParticipantFetchedSuccess } = require("@/responses/success/participant.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, BAD_REQUEST } = require("@configs/http-status.config");
const { filterParticipantDataByUserType } = require("@utils/data-filter.util");

/**
 * GET /api/v1/participants/get/:entityType/:meetingId/:participantId
 * Fetch a single participant from a meeting by MongoDB _id
 * 
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.adminId: Admin ID if user is admin (for data filtering)
 * 
 * PARAMS:
 * - participantId: MongoDB _id of the participant (not userId)
 */
const getParticipantController = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { meeting, project, adminId } = req;

    logWithTime(
      `📍 [getParticipantController] Fetching participant ${participantId} | ${getLogIdentifiers(req)}`
    );

    // ── 1. Call service to fetch participant ──────────────────────────────
    const result = await getParticipantService(meeting, participantId);

    if (!result.success) {
      logWithTime(
        `[getParticipantController] ❌ Error: ${result.message} | ${getLogIdentifiers(req)}`
      );

      if (result.errorCode === NOT_FOUND) {
        return throwNotFoundError(res, result.message);
      }
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }

      return throwInternalServerError(res, result.message);
    }

    // ── 2. Filter participant data based on user type ──────────────────────
    const isAdmin = !!adminId;
    const filteredParticipant = filterParticipantDataByUserType(
      result.participant,
      isAdmin
    );

    logWithTime(
      `✅ [getParticipantController] Participant fetched successfully | ${getLogIdentifiers(req)}`
    );

    return sendParticipantFetchedSuccess(res, filteredParticipant);

  } catch (error) {
    logWithTime(
      `❌ [getParticipantController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, "Error fetching participant");
  }
};

module.exports = { getParticipantController };
