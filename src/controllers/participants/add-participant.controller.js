// controllers/meetings/participants/add-participant.controller.js

const { addParticipantService } = require("@services/participants");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendParticipantAddedSuccess } = require("@/responses/success/participant.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");
const { ParticipantTypes, ProjectRoleTypes } = require("@configs/enums.config");

/**
 * POST /meetings/:meetingId/participants
 * Add a new participant to a meeting
 * 
 * AUTHORIZATION:
 * - User must be meeting FACILITATOR OR project OWNER
 * 
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.participant: { role } - User's role in meeting
 * - req.stakeholder: { role } - User's role in project (optional)
 */
const addParticipantController = async (req, res) => {
  try {
    const { userId, roleDescription } = req.body;
    const { meeting, project, participant, stakeholder } = req;

    logWithTime(
      `📍 [addParticipantController] Adding participant to meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── AUTHORIZATION CHECK (CONTROLLER LEVEL) ─────────────────────────
    const isFacilitator = participant?.role === ParticipantTypes.FACILITATOR;
    const isProjectOwner = stakeholder?.role === ProjectRoleTypes.OWNER;

    if (!isFacilitator && !isProjectOwner) {
      logWithTime(
        `❌ [addParticipantController] User not authorized. Must be meeting FACILITATOR or project OWNER | ${getLogIdentifiers(req)}`
      );
      return throwAccessDeniedError(res, "Not authorized. Only meeting facilitators or project owners can add participants");
    }

    logWithTime(
      `✅ [addParticipantController] Authorization passed | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await addParticipantService(
      meeting,
      project,
      {
        userId,
        role: ParticipantTypes.PARTICIPANT,
        roleDescription,
        addedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [addParticipantController] Error occurred | Message: ${result.message}, ErrorCode: ${result.errorCode} | ${getLogIdentifiers(req)}`);
      
      // Use errorCode to determine which error handler to call
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [addParticipantController] Returning CONFLICT (409) error: ${result.message}`);
        return throwBadRequestError(res, result.message);
      }
      
      logWithTime(`⚠️ [addParticipantController] Returning BAD_REQUEST (400) error: ${result.message}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(`✅ [addParticipantController] Participant added successfully | ${getLogIdentifiers(req)}`);
    return sendParticipantAddedSuccess(res, result.participant);

  } catch (error) {
    logWithTime(`❌ [addParticipantController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { addParticipantController };
