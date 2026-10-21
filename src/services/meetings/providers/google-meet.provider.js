// services/meetings/providers/google-meet.provider.js

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { validateMeetingLink } = require("@utils/meeting-validation.util");
const { MeetingPlatformTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Creates a Google Meet meeting using the official Google API.
 * Google Meet does not issue meeting passwords.
 *
 * @param {Object} options
 * @param {string} options.title - Meeting title
 * @param {string} [options.agenda] - Meeting agenda / description
 * @param {Date} [options.startTime] - Meeting start time
 * @param {number} [options.durationMinutes] - Duration in minutes
 * @param {boolean} [options.isMeetingPasswordRequired] - Accepted flag
 * @param {number} timeoutMs - Request timeout in milliseconds
 * @returns {Promise<{ meetingLink: string, providerMeetingId: string, meetingPassword: null, platform: string, passwordNote?: string }>}
 */
const createGoogleMeet = async ({
  title,
  agenda,
  startTime = new Date(),
  durationMinutes = 30,
  isMeetingPasswordRequired = false
}, timeoutMs = 4000) => {
  logWithTime(`[GoogleMeetProvider] Creating Google Meet meeting: "${title}"`);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error("Google Meet configuration missing: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured.");
  }

  let token = accessToken;

  // If refresh token is available and no direct access token, exchange for access token
  if (!token && refreshToken) {
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      },
      { timeout: timeoutMs }
    );
    token = tokenRes.data?.access_token;
  }

  // If we have an access token, call Google Calendar / Meet API
  if (token) {
    const end = new Date(new Date(startTime).getTime() + durationMinutes * 60 * 1000);
    const eventRes = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        summary: title,
        description: agenda || "",
        start: { dateTime: new Date(startTime).toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: timeoutMs
      }
    );

    const hangoutLink = eventRes.data?.hangoutLink ||
      eventRes.data?.conferenceData?.entryPoints?.find(ep => ep.entryPointType === "video")?.uri;
    const providerMeetingId = eventRes.data?.id || eventRes.data?.conferenceData?.conferenceId;

    if (hangoutLink) {
      const validation = validateMeetingLink(MeetingPlatformTypes.GOOGLE_MEET, hangoutLink);
      if (!validation.valid) {
        throw new Error(`Google Meet API returned an invalid link format: ${hangoutLink}`);
      }

      return {
        platform: MeetingPlatformTypes.GOOGLE_MEET,
        meetingLink: hangoutLink,
        providerMeetingId: providerMeetingId || null,
        meetingPassword: null,
        passwordNote: isMeetingPasswordRequired
          ? "Google Meet does not support meeting passwords. Access is controlled via Google account authentication and admission waiting room."
          : undefined
      };
    }
  }

  // If token was not obtain-able via standard OAuth (e.g. client_credentials not supported by Google),
  // attempt Google Meet REST API v2 spaces endpoint or throw clear error
  throw new Error("Google Meet OAuth authorization requires a valid Google account access or refresh token.");
};

module.exports = {
  createGoogleMeet
};
