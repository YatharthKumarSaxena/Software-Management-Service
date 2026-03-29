const { StakeholderModel } = require("@/models/stakeholder.model");
const { throwAccessDeniedError, throwInternalServerError, logMiddlewareError, throwSpecificInternalServerError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Validate that user is a participant in the meeting
 * Must run AFTER fetchMeetingMiddleware
 * 
 * Attaches:
 * - req.meeting: The meeting document (alias for foundMeeting)
 * - req.participantContext: { userId, participant, isFacilitator }
 * - req.participant: { role } - User's role in this meeting
 * - req.stakeholder: { role } - User's role in the project (optional)
 */
const validateUserIsParticipantMiddleware = async (req, res, next) => {
  try {
    if (!req.foundMeeting) {
      logMiddlewareError("validateUserIsParticipant", "Meeting not found in request context", req);
      return throwSpecificInternalServerError(res, "Meeting not found in request context");
    }

    // Get userId from request (could be from admin or user context)
    const userId = req.admin?.adminId || req.client?.clientId;

    if (!userId) {
      logMiddlewareError("validateUserIsParticipant", "User authentication required", req);
      return throwAccessDeniedError(res, "User authentication required");
    }

    // Check if user is a participant (not soft-deleted)
    const participant = req.foundMeeting.participants.find(
      p => p.userId === userId && !p.isDeleted
    );

    if (!participant) {
      logMiddlewareError("validateUserIsParticipant", `User ${userId} is not a participant of meeting ${req.foundMeeting._id}`, req);
      return throwAccessDeniedError(res, "You do not have permission to access this meeting");
    }

    // Set meeting alias for controllers
    req.meeting = req.foundMeeting;

    // Set participant role for authorization checks
    req.participant = {
      role: participant.role
    };

    // Fetch stakeholder role (optional - for authorization checks in update)
    if (req.project && req.project._id) {
      try {
        const projectId = req.project._id;
        const stakeholder = await StakeholderModel.findOne({
          projectId,
          userId,
          isDeleted: false
        }).lean();

        if (stakeholder) {
          req.stakeholder = {
            role: stakeholder.role
          };
        }
      } catch (stakeholderError) {
        logWithTime(`⚠️ [validateUserIsParticipant] Could not fetch stakeholder role: ${stakeholderError.message}`);
        // Continue anyway - stakeholder role is optional
      }
    }

    req.participantContext = {
      userId,
      participant,
      isFacilitator: participant.role === 'FACILITATOR'
    };

    logWithTime(`✅ User ${userId} validated as participant of meeting ${req.foundMeeting._id}`);
    return next();

  } catch (error) {
    logMiddlewareError("validateUserIsParticipant", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  validateUserIsParticipantMiddleware
};
