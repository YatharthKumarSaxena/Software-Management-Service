// controllers/meetings/participants/remove-participant.controller.js

const { removeParticipantService } = require("@services/participants");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendParticipantRemovedSuccess } = require("@/responses/success/participant.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND } = require("@configs/http-status.config");
const { ParticipantTypes, ProjectRoleTypes } = require("@configs/enums.config");

/**
 * DELETE /meetings/:meetingId/participants/:userId
 * Remove a participant from a meeting
 * 
 * AUTHORIZATION:
 * - User must be meeting FACILITATOR OR project OWNER
 * 
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.participant: { role } - User's role in meeting
 * - req.stakeholder: { role } - User's role in project (optional)
 * - req.params.userId: User ID to remove
 */
const removeParticipantController = async (req, res) => {
  try {
    const { userId, removeReason } = req.body;
    const { meeting, project, participant, stakeholder } = req;

    logWithTime(
      `📍 [removeParticipantController] Removing participant from meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── AUTHORIZATION CHECK (CONTROLLER LEVEL) ─────────────────────────
    const isFacilitator = participant?.role === ParticipantTypes.FACILITATOR;
    const isProjectOwner = stakeholder?.role === ProjectRoleTypes.OWNER;

    if (!isFacilitator && !isProjectOwner) {
      logWithTime(
        `❌ [removeParticipantController] User not authorized. Must be meeting FACILITATOR or project OWNER | ${getLogIdentifiers(req)}`
      );
      return throwAccessDeniedError(res, "Not authorized. Only meeting facilitators or project owners can remove participants");
    }

    logWithTime(
      `✅ [removeParticipantController] Authorization passed | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await removeParticipantService(
      meeting,
      project,
      {
        userId,
        removedBy: req.admin.adminId,
        removeReason,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [removeParticipantController] Error occurred | Message: ${result.message}, ErrorCode: ${result.errorCode} | ${getLogIdentifiers(req)}`);
      
      // Use errorCode to determine which error handler to call
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`⚠️ [removeParticipantController] Returning NOT_FOUND (404) error: ${result.message}`);
        return throwBadRequestError(res, result.message);
      }
      
      logWithTime(`⚠️ [removeParticipantController] Returning BAD_REQUEST (400) error: ${result.message}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(`✅ [removeParticipantController] Participant removed successfully | ${getLogIdentifiers(req)}`);
    return sendParticipantRemovedSuccess(res, result.participant);

  } catch (error) {
    logWithTime(`❌ [removeParticipantController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { removeParticipantController };
