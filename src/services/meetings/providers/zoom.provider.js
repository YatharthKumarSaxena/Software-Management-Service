// services/meetings/providers/zoom.provider.js

const axios = require("axios");
const { validateMeetingLink } = require("@utils/meeting-validation.util");
const { MeetingPlatformTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Creates a Zoom meeting using the official Zoom REST API v2.
 * Zoom supports meeting passwords.
 *
 * @param {Object} options
 * @param {string} options.title - Meeting topic
 * @param {string} [options.agenda] - Meeting agenda / description
 * @param {Date} [options.startTime] - Start date/time
 * @param {number} [options.durationMinutes] - Duration in minutes
 * @param {boolean} [options.isMeetingPasswordRequired] - Whether password is required
 * @param {number} timeoutMs - Request timeout in milliseconds
 * @returns {Promise<{ meetingLink: string, providerMeetingId: string, meetingPassword: string|null, platform: string }>}
 */
const createZoomMeeting = async ({
  title,
  agenda,
  startTime = new Date(),
  durationMinutes = 30,
  isMeetingPasswordRequired = false
}, timeoutMs = 4000) => {
  logWithTime(`[ZoomProvider] Creating Zoom meeting: "${title}"`);

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const accountId = process.env.ZOOM_ACCOUNT_ID;

  if (!clientId || !clientSecret) {
    throw new Error("Zoom configuration missing: ZOOM_CLIENT_ID or ZOOM_CLIENT_SECRET is not configured.");
  }

  // 1. Get access token from Zoom OAuth
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenUrl = accountId
    ? `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`
    : `https://zoom.us/oauth/token?grant_type=client_credentials`;

  const authRes = await axios.post(
    tokenUrl,
    {},
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: timeoutMs
    }
  );

  const accessToken = authRes.data?.access_token;
  if (!accessToken) {
    throw new Error("Failed to acquire access token from Zoom OAuth endpoint.");
  }

  // 2. Create meeting via Zoom API
  const meetingPayload = {
    topic: title,
    agenda: agenda || undefined,
    type: 2, // Scheduled meeting
    start_time: new Date(startTime).toISOString(),
    duration: durationMinutes,
    settings: {
      waiting_room: true,
      join_before_host: false,
      meeting_authentication: false
    }
  };

  const meetingRes = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    meetingPayload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      timeout: timeoutMs
    }
  );

  const joinUrl = meetingRes.data?.join_url;
  const providerMeetingId = meetingRes.data?.id ? String(meetingRes.data.id) : null;
  const password = meetingRes.data?.password || null;

  if (!joinUrl) {
    throw new Error("Zoom API did not return a join URL for the meeting.");
  }

  // Validate format against zoomMeetRegex
  const validation = validateMeetingLink(MeetingPlatformTypes.ZOOM, joinUrl);
  if (!validation.valid) {
    throw new Error(`Zoom API returned an invalid link format: ${joinUrl}`);
  }

  return {
    platform: MeetingPlatformTypes.ZOOM,
    meetingLink: joinUrl,
    providerMeetingId,
    meetingPassword: password
  };
};

module.exports = {
  createZoomMeeting
};
