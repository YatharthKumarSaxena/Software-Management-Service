// services/meetings/providers/ms-teams.provider.js

const axios = require("axios");
const { validateMeetingLink } = require("@utils/meeting-validation.util");
const { MeetingPlatformTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Creates a Microsoft Teams online meeting using Microsoft Graph API.
 * Microsoft Teams does not issue standalone meeting passwords for Graph online meetings.
 *
 * @param {Object} options
 * @param {string} options.title - Meeting subject
 * @param {string} [options.agenda] - Meeting agenda / description
 * @param {Date} [options.startTime] - Start date/time
 * @param {number} [options.durationMinutes] - Duration in minutes
 * @param {boolean} [options.isMeetingPasswordRequired] - Accepted flag
 * @param {number} timeoutMs - Request timeout in milliseconds
 * @returns {Promise<{ meetingLink: string, providerMeetingId: string, meetingPassword: null, platform: string, passwordNote?: string }>}
 */
const createTeamsMeeting = async ({
  title,
  agenda,
  startTime = new Date(),
  durationMinutes = 30,
  isMeetingPasswordRequired = false
}, timeoutMs = 4000) => {
  logWithTime(`[TeamsProvider] Creating Microsoft Teams meeting: "${title}"`);

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID;

  if (!clientId || !clientSecret || !tenantId) {
    throw new Error("Microsoft Teams configuration missing: MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, or MICROSOFT_TENANT_ID is not configured.");
  }

  // 1. Get access token from Azure AD
  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const authRes = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    tokenParams.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: timeoutMs
    }
  );

  const accessToken = authRes.data?.access_token;
  if (!accessToken) {
    throw new Error("Failed to acquire access token from Microsoft identity platform.");
  }

  // 2. Create online meeting via Microsoft Graph
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const meetingPayload = {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
    subject: title
  };

  const meetingRes = await axios.post(
    "https://graph.microsoft.com/v1.0/communications/onlineMeetings",
    meetingPayload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      timeout: timeoutMs
    }
  );

  const joinWebUrl = meetingRes.data?.joinWebUrl;
  const providerMeetingId = meetingRes.data?.id;

  if (!joinWebUrl) {
    throw new Error("Microsoft Graph API did not return a join URL for the online meeting.");
  }

  // Validate format against teamsRegex
  const validation = validateMeetingLink(MeetingPlatformTypes.TEAMS, joinWebUrl);
  if (!validation.valid) {
    throw new Error(`Microsoft Teams API returned an invalid link format: ${joinWebUrl}`);
  }

  return {
    platform: MeetingPlatformTypes.TEAMS,
    meetingLink: joinWebUrl,
    providerMeetingId: providerMeetingId || null,
    meetingPassword: null,
    passwordNote: isMeetingPasswordRequired
      ? "Microsoft Teams does not support meeting passwords for standard online meetings. Access is controlled via tenant permissions and waiting lobby."
      : undefined
  };
};

module.exports = {
  createTeamsMeeting
};
