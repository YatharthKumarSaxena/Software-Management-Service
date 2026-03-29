// controllers/meetings/update-meeting.controller.js

const { updateMeetingService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendMeetingUpdatedSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK, UNAUTHORIZED } = require("@configs/http-status.config");

/**
 * PUT /meetings/:meetingId
 * Update a meeting (only allowed if status is DRAFT)
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
const updateMeetingController = async (req, res) => {
  try {
    const { title, description, meetingGroup, platform, facilitatorId } = req.body;
    const { meeting, project, participant, stakeholder } = req;

    logWithTime(
      `📍 [updateMeetingController] Updating meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await updateMeetingService(
      meeting,
      project,
      {
        title,
        description,
        meetingGroup,
        platform,
        facilitatorId,
        updatedBy: req.admin.adminId,
        participantRole: participant?.role,
        stakeholderRole: stakeholder?.role,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [updateMeetingController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      // Check if it's an authorization error
      if (result.errorCode === UNAUTHORIZED) {
        return throwAccessDeniedError(res, result.message);
      }
      
      return throwBadRequestError(res, result.message);
    }

    if (result.message === "No changes detected") {
      return res.status(OK).json({
        success: true,
        message: "No changes detected. Meeting remains unchanged."
      });
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(`✅ [updateMeetingController] Meeting updated successfully | ${getLogIdentifiers(req)}`);
    return sendMeetingUpdatedSuccess(res, result.meeting);

  } catch (error) {
    logWithTime(`❌ [updateMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateMeetingController };
