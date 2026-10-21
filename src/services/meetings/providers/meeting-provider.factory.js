// services/meetings/providers/meeting-provider.factory.js

const { MeetingPlatformTypes } = require("@configs/enums.config");
const { getMeetingApiTimeoutMs, getDefaultMeetingDurationMinutes } = require("./provider-config");
const { createGoogleMeet } = require("./google-meet.provider");
const { createTeamsMeeting } = require("./ms-teams.provider");
const { createZoomMeeting } = require("./zoom.provider");
const { logWithTime } = require("@utils/time-stamps.util");

let mockHandler = null;

/**
 * Sets a mock provider handler for testing purposes.
 * @param {Function|null} handler - (params) => Promise<meetingDetails>
 */
const setMockProviderHandler = (handler) => {
  mockHandler = handler;
};

/**
 * Resets the mock provider handler.
 */
const resetMockProviderHandler = () => {
  mockHandler = null;
};

/**
 * Human-readable provider display names
 */
const PROVIDER_NAMES = {
  [MeetingPlatformTypes.GOOGLE_MEET]: "Google Meet",
  [MeetingPlatformTypes.TEAMS]: "Microsoft Teams",
  [MeetingPlatformTypes.ZOOM]: "Zoom"
};

/**
 * Wraps a promise with a hard timeout.
 * If the promise does not resolve within timeoutMs, rejects with a timeout error.
 *
 * @param {Promise} promise
 * @param {number} timeoutMs
 * @param {string} providerName
 * @returns {Promise}
 */
const withTimeout = (promise, timeoutMs, providerName) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${providerName} API request timed out after ${timeoutMs}ms.`);
      err.code = "ECONNABORTED";
      err.isTimeout = true;
      reject(err);
    }, timeoutMs);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeoutPromise
  ]);
};

/**
 * Generates an automatic meeting using the selected provider's official API.
 *
 * @param {Object} params
 * @param {string} [params.platform] - MeetingPlatformTypes (GOOGLE_MEET, TEAMS, ZOOM)
 * @param {string} params.title - Meeting title
 * @param {string} [params.agenda] - Meeting agenda / description
 * @param {Date} [params.startTime] - Start date/time
 * @param {number} [params.durationMinutes] - Duration in minutes
 * @param {boolean} [params.isMeetingPasswordRequired] - Whether password is requested
 * @param {string} [params.requestId] - Idempotency / tracing ID
 *
 * @returns {Promise<{
 *   success: boolean,
 *   meetingLink?: string,
 *   providerMeetingId?: string,
 *   meetingPassword?: string|null,
 *   platform?: string,
 *   passwordNote?: string,
 *   message?: string,
 *   isTimeout?: boolean,
 *   isUnavailable?: boolean,
 *   action?: string,
 *   fallbackAvailable?: boolean
 * }>}
 */
const generateMeetingFromProvider = async ({
  platform = MeetingPlatformTypes.GOOGLE_MEET,
  title,
  agenda,
  startTime,
  durationMinutes,
  isMeetingPasswordRequired = false,
  requestId
}) => {
  const timeoutMs = getMeetingApiTimeoutMs();
  const effectiveDuration = durationMinutes || getDefaultMeetingDurationMinutes();
  const effectiveStartTime = startTime ? new Date(startTime) : new Date();

  // Validate supported platform
  const supportedPlatforms = [
    MeetingPlatformTypes.GOOGLE_MEET,
    MeetingPlatformTypes.TEAMS,
    MeetingPlatformTypes.ZOOM
  ];

  if (!supportedPlatforms.includes(platform)) {
    return {
      success: false,
      message: `Automatic meeting creation is not supported for platform: "${platform}". Supported platforms: ${supportedPlatforms.join(", ")}. Please use manual meeting link workflow.`,
      isBadRequest: true,
      action: "USE_MANUAL_LINK",
      fallbackAvailable: true
    };
  }

  const providerName = PROVIDER_NAMES[platform] || platform;

  logWithTime(`[MeetingProviderFactory] Dispatching to ${providerName} (timeout: ${timeoutMs}ms)`);

  // Check if testing mock handler is configured
  if (mockHandler) {
    try {
      const mockResult = await withTimeout(
        Promise.resolve().then(() => mockHandler({
          platform,
          title,
          agenda,
          startTime: effectiveStartTime,
          durationMinutes: effectiveDuration,
          isMeetingPasswordRequired,
          timeoutMs,
          requestId
        })),
        timeoutMs,
        providerName
      );

      return {
        success: true,
        ...mockResult
      };
    } catch (err) {
      logWithTime(`❌ [MeetingProviderFactory] Mock handler failed: ${err.message}`);
      return handleProviderError(err, providerName, timeoutMs);
    }
  }

  // Live provider execution
  try {
    let providerCall;
    switch (platform) {
      case MeetingPlatformTypes.GOOGLE_MEET:
        providerCall = createGoogleMeet({
          title,
          agenda,
          startTime: effectiveStartTime,
          durationMinutes: effectiveDuration,
          isMeetingPasswordRequired
        }, timeoutMs);
        break;

      case MeetingPlatformTypes.TEAMS:
        providerCall = createTeamsMeeting({
          title,
          agenda,
          startTime: effectiveStartTime,
          durationMinutes: effectiveDuration,
          isMeetingPasswordRequired
        }, timeoutMs);
        break;

      case MeetingPlatformTypes.ZOOM:
        providerCall = createZoomMeeting({
          title,
          agenda,
          startTime: effectiveStartTime,
          durationMinutes: effectiveDuration,
          isMeetingPasswordRequired
        }, timeoutMs);
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const providerResult = await withTimeout(providerCall, timeoutMs, providerName);

    return {
      success: true,
      ...providerResult
    };

  } catch (err) {
    logWithTime(`❌ [MeetingProviderFactory] Provider ${providerName} execution error: ${err.message}`);
    return handleProviderError(err, providerName, timeoutMs);
  }
};

/**
 * Standardizes provider failure and timeout errors into clear, actionable responses.
 *
 * @param {Error} err
 * @param {string} providerName
 * @param {number} timeoutMs
 * @returns {Object}
 */
const handleProviderError = (err, providerName, timeoutMs) => {
  const isTimeout =
    err.isTimeout === true ||
    err.code === "ECONNABORTED" ||
    (err.message && err.message.toLowerCase().includes("timeout")) ||
    (err.response && (err.response.status === 408 || err.response.status === 504));

  if (isTimeout) {
    return {
      success: false,
      isTimeout: true,
      isUnavailable: false,
      message: `${providerName} service request timed out after ${timeoutMs}ms. Please retry or enter a meeting link manually.`,
      action: "RETRY_OR_MANUAL_LINK",
      fallbackAvailable: true,
      details: err.message
    };
  }

  // Network / Auth / Provider downtime / Unavailability
  const reason = err.response?.data?.error?.message ||
    err.response?.data?.message ||
    err.response?.data?.reason ||
    err.message ||
    "Service unavailable";

  return {
    success: false,
    isTimeout: false,
    isUnavailable: true,
    message: `${providerName} is temporarily unavailable or encountered an error (${reason}). Please retry or enter a meeting link manually.`,
    action: "RETRY_OR_MANUAL_LINK",
    fallbackAvailable: true,
    details: reason
  };
};

module.exports = {
  generateMeetingFromProvider,
  setMockProviderHandler,
  resetMockProviderHandler,
  PROVIDER_NAMES
};
