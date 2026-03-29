const { MeetingModel } = require("@/models/meeting.model");
const { throwBadRequestError, logMiddlewareError, throwDBResourceNotFoundError, throwInternalServerError } = require("@/responses/common/error-handler.response");
const { isValidMongoID } = require("@/utils/id-validators.util");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Fetch meeting by ID and attach to req.foundMeeting
 * Validates meetingId format and document exists
 */
const fetchMeetingMiddleware = async (req, res, next) => {
    try {
        const { meetingId } = req.params;

        if (!meetingId) {
            logMiddlewareError("fetchMeeting", "meetingId parameter is missing", req);
            return throwBadRequestError(res, "meetingId parameter is required");
        }

        // Validate ObjectId format
        if (!isValidMongoID(meetingId)) {
            logMiddlewareError("fetchMeeting", `Invalid meetingId format: ${meetingId}`, req);
            return throwBadRequestError(res, "Invalid meetingId format");
        }

        // Check Meeting Exist for Elicitation or Negotiation
        const meeting = await MeetingModel.findOne({
            _id: meetingId,
            entityType: req.params.entityType
        });

        if (!meeting) {
            logMiddlewareError("fetchMeeting", `Meeting not found: ${meetingId}`, req);
            return throwDBResourceNotFoundError(res, "meetingId");
        }

        req.foundMeeting = meeting;
        req.projectId = meeting.projectId;

        logWithTime(`✅ Meeting fetched successfully: ${meetingId} `);
        return next();

    } catch (error) {
        logMiddlewareError("fetchMeeting", `Error fetching meeting: ${error.message}`, req);
        return throwInternalServerError(res, "Error fetching meeting");
    }
};

module.exports = {
    fetchMeetingMiddleware
};
