// controllers/meetings/participants/update-participant.controller.js

const { updateParticipantService } = require("@services/participants");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendParticipantUpdatedSuccess } = require("@/responses/success/participant.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND } = require("@configs/http-status.config");
const { ParticipantTypes, ProjectRoleTypes } = require("@configs/enums.config");

/**
 * PUT /meetings/:meetingId/participants/:userId
 * Update a participant's role or role description
 * 
 * AUTHORIZATION:
 * - User must be meeting FACILITATOR OR project OWNER
 * 
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.participant: { role } - User's role in meeting
 * - req.stakeholder: { role } - User's role in project (optional)
 * - req.params.userId: User ID to update
 */
const updateParticipantController = async (req, res) => {
  try {
    const { userId, roleDescription } = req.body;
    const { meeting, project, participant, stakeholder } = req;

    logWithTime(
      `📍 [updateParticipantController] Updating participant in meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── AUTHORIZATION CHECK (CONTROLLER LEVEL) ─────────────────────────
    const isFacilitator = participant?.role === ParticipantTypes.FACILITATOR;
    const isProjectOwner = stakeholder?.role === ProjectRoleTypes.OWNER;

    if (!isFacilitator && !isProjectOwner) {
      logWithTime(
        `❌ [updateParticipantController] User not authorized. Must be meeting FACILITATOR or project OWNER | ${getLogIdentifiers(req)}`
      );
      return throwAccessDeniedError(res, "Not authorized. Only meeting facilitators or project owners can update participants");
    }

    logWithTime(
      `✅ [updateParticipantController] Authorization passed | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await updateParticipantService(
      meeting,
      project,
      {
        userId,
        role: ParticipantTypes.PARTICIPANT, // Default to PARTICIPANT
        roleDescription,
        updatedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [updateParticipantController] Error occurred | Message: ${result.message}, ErrorCode: ${result.errorCode} | ${getLogIdentifiers(req)}`);
      
      // Use errorCode to determine which error handler to call
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`⚠️ [updateParticipantController] Returning NOT_FOUND (404) error: ${result.message}`);
        return throwBadRequestError(res, result.message);
      }
      
      logWithTime(`⚠️ [updateParticipantController] Returning BAD_REQUEST (400) error: ${result.message}`);
      return throwBadRequestError(res, result.message);
    }

    // Check if no changes were made
    if (result.message === "No changes detected") {
      logWithTime(`⚠️ [updateParticipantController] No changes detected | ${getLogIdentifiers(req)}`);
      return res.status(200).json({
        success: true,
        message: "No changes detected. Participant remains unchanged."
      });
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(`✅ [updateParticipantController] Participant updated successfully | ${getLogIdentifiers(req)}`);
    return sendParticipantUpdatedSuccess(res, result.participant);

  } catch (error) {
    logWithTime(`❌ [updateParticipantController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateParticipantController };
