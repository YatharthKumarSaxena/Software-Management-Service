// utils/meeting-validation.util.js

const { MeetingPlatformTypes } = require("@configs/enums.config");

/**
 * Meeting link validation regex patterns per platform
 */
const MEETING_LINK_PATTERNS = {
  [MeetingPlatformTypes.GOOGLE_MEET]: /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/,
  [MeetingPlatformTypes.ZOOM]: /^https:\/\/([a-z0-9-]+\.)?zoom\.us\/j\/\d+(\?pwd=[\w-]+)?$/,
  [MeetingPlatformTypes.TEAMS]: /^https:\/\/teams\.microsoft\.com\/l\/meetup-join\/.+$/,
  [MeetingPlatformTypes.OTHER]: null // No validation for OTHER platform
};

/**
 * Validates a meeting link against the specified platform's pattern
 *
 * @param {string} platform - Platform type (GOOGLE_MEET, ZOOM, TEAMS, OTHER)
 * @param {string} link - Meeting link to validate
 * @returns {{ valid: boolean, message?: string }}
 */
const validateMeetingLink = (platform, link) => {
  if (!platform || !link) {
    return {
      valid: false,
      message: "Platform and meeting link are required"
    };
  }

  // For OTHER platform, skip validation
  if (platform === MeetingPlatformTypes.OTHER) {
    return { valid: true };
  }

  // Get the regex pattern for the platform
  const pattern = MEETING_LINK_PATTERNS[platform];

  if (!pattern) {
    return {
      valid: false,
      message: `Unknown platform: ${platform}`
    };
  }

  // Test the link against the pattern
  if (!pattern.test(link)) {
    return {
      valid: false,
      message: `Meeting link does not match ${platform} format. Expected: ${getExpectedFormat(platform)}`
    };
  }

  return { valid: true };
};

/**
 * Get human-readable expected format for each platform
 *
 * @param {string} platform - Platform type
 * @returns {string} Expected format description
 */
const getExpectedFormat = (platform) => {
  const formats = {
    [MeetingPlatformTypes.GOOGLE_MEET]: "https://meet.google.com/abc-defg-hij",
    [MeetingPlatformTypes.ZOOM]: "https://zoom.us/j/123456789 or https://zoom.us/j/123456789?pwd=...",
    [MeetingPlatformTypes.TEAMS]: "https://teams.microsoft.com/l/meetup-join/...",
    [MeetingPlatformTypes.OTHER]: "Any valid URL"
  };
  return formats[platform] || "Unknown";
};

/**
 * Checks if two time windows overlap
 * 
 * Returns true if there's any overlap between:
 * [start1, end1] and [start2, end2]
 *
 * @param {Date} start1 - Start of first time window
 * @param {Date} end1 - End of first time window
 * @param {Date} start2 - Start of second time window
 * @param {Date} end2 - End of second time window
 * @returns {boolean} true if windows overlap, false otherwise
 */
const isTimeOverlapping = (start1, end1, start2, end2) => {
  // Validate inputs
  if (!start1 || !end1 || !start2 || !end2) {
    return false;
  }

  // Convert to timestamps for comparison
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  // Two ranges [s1,e1] and [s2,e2] overlap if:
  // s1 < e2 AND s2 < e1
  return s1 < e2 && s2 < e1;
};

/**
 * Validates if a platform value is valid
 *
 * @param {string} platform - Platform to validate
 * @returns {{ valid: boolean, message?: string }}
 */
const validatePlatform = (platform) => {
  const validPlatforms = Object.values(MeetingPlatformTypes);

  if (!platform) {
    return {
      valid: false,
      message: "Platform is required"
    };
  }

  if (!validPlatforms.includes(platform)) {
    return {
      valid: false,
      message: `Invalid platform. Must be one of: ${validPlatforms.join(", ")}`
    };
  }

  return { valid: true };
};

module.exports = {
  validateMeetingLink,
  isTimeOverlapping,
  validatePlatform,
  MEETING_LINK_PATTERNS,
  getExpectedFormat
};
