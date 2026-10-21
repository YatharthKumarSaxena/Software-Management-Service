// services/meetings/providers/provider-config.js

/**
 * Returns the configured meeting API timeout in milliseconds.
 * Defaults to 4000ms if not set or invalid.
 */
const getMeetingApiTimeoutMs = () => {
  const envVal = process.env.MEETING_API_TIMEOUT_MS;
  if (envVal !== undefined && envVal !== null && envVal !== "") {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 4000;
};

/**
 * Returns default meeting duration in minutes.
 * Defaults to 30 or 60 minutes.
 */
const getDefaultMeetingDurationMinutes = () => {
  const envVal = process.env.DEFAULT_MEETING_DURATION_MINUTES;
  if (envVal !== undefined && envVal !== null && envVal !== "") {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 30;
};

module.exports = {
  getMeetingApiTimeoutMs,
  getDefaultMeetingDurationMinutes
};
