const { MeetingStatuses } = require("@/configs/enums.config");
const { throwConflictError, throwInternalServerError, logMiddlewareError, throwSpecificInternalServerError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Guard: Prevent updates/cancellations if meeting status is not DRAFT
 * Must run AFTER fetchMeetingMiddleware
 */
const meetingStatusGuardMiddleware = (req, res, next) => {
  try {
    if (!req.foundMeeting) {
      logMiddlewareError("meetingStatusGuard", "Meeting not found in request context", req);
      return throwSpecificInternalServerError(res, "Meeting not found in request context");
    }

    const currentStatus = req.foundMeeting.status;

    // Only allow modifications (UPDATE/DELETE) if status is DRAFT
    if (currentStatus !== MeetingStatuses.DRAFT) {
      logMiddlewareError("meetingStatusGuard", `Cannot modify meeting ${req.foundMeeting._id} with status ${currentStatus}`, req);
      return throwConflictError(
        res,
        `Cannot modify meeting with status: ${currentStatus}`,
        `Only DRAFT meetings can be modified. Current status is ${currentStatus}.`
      );
    }

    logWithTime(`✅ Meeting status guard passed for ${req.foundMeeting._id}`);
    return next();

  } catch (error) {
    logMiddlewareError("meetingStatusGuard", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  meetingStatusGuardMiddleware
};
