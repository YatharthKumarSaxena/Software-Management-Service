// testing/meeting-providers.test.js

require("module-alias/register");
const assert = require("assert");
const { MeetingPlatformTypes } = require("@configs/enums.config");
const {
  generateMeetingFromProvider,
  setMockProviderHandler,
  resetMockProviderHandler
} = require("@services/meetings/providers/meeting-provider.factory");
const { getMeetingApiTimeoutMs } = require("@services/meetings/providers/provider-config");
const { googleMeetRegex, zoomMeetRegex, teamsRegex } = require("@configs/regex.config");

const runProviderTests = async () => {
  console.log("\n=======================================================");
  console.log("  TEST SUITE 1: Meeting Providers & Factory Tests");
  console.log("=======================================================");

  // 1. Timeout Config Test
  console.log("\n[Test 1.1] Timeout Configuration verification");
  const defaultTimeout = getMeetingApiTimeoutMs();
  assert.strictEqual(typeof defaultTimeout, "number", "Timeout must be a number");
  assert.ok(defaultTimeout >= 1000, `Timeout must be at least 1000ms (got ${defaultTimeout})`);
  console.log(`✓ Configured MEETING_API_TIMEOUT_MS: ${defaultTimeout}ms`);

  // 2. Google Meet Provider Test (Mocked official API return)
  console.log("\n[Test 1.2] Google Meet generation & password capability");
  setMockProviderHandler(async ({ platform, title }) => {
    return {
      platform,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      providerMeetingId: "google-event-12345",
      meetingPassword: null,
      passwordNote: "Google Meet does not support meeting passwords. Access is controlled via Google account authentication and admission waiting room."
    };
  });

  const googleResult = await generateMeetingFromProvider({
    platform: MeetingPlatformTypes.GOOGLE_MEET,
    title: "Sprint Review",
    isMeetingPasswordRequired: true
  });

  assert.strictEqual(googleResult.success, true, "Google Meet creation should succeed");
  assert.ok(googleMeetRegex.test(googleResult.meetingLink), `Link ${googleResult.meetingLink} must match googleMeetRegex`);
  assert.strictEqual(googleResult.meetingPassword, null, "Google Meet must return null password (never invented)");
  assert.ok(googleResult.passwordNote.includes("Google Meet does not support meeting passwords"), "Must include informative note if password requested");
  console.log(`✓ Google Meet successfully generated link: ${googleResult.meetingLink}`);
  console.log(`✓ Google Meet password correctly handled as null without error`);

  // 3. Microsoft Teams Provider Test (Mocked official API return)
  console.log("\n[Test 1.3] Microsoft Teams generation & password capability");
  setMockProviderHandler(async ({ platform, title }) => {
    return {
      platform,
      meetingLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_xyz%40thread.v2/0?context=%7b%22Tid%22%3a%22abc%22%7d",
      providerMeetingId: "MSoXYZ123456",
      meetingPassword: null,
      passwordNote: "Microsoft Teams does not support meeting passwords for standard online meetings. Access is controlled via tenant permissions and waiting lobby."
    };
  });

  const teamsResult = await generateMeetingFromProvider({
    platform: MeetingPlatformTypes.TEAMS,
    title: "Architecture Sync",
    isMeetingPasswordRequired: true
  });

  assert.strictEqual(teamsResult.success, true, "Teams creation should succeed");
  assert.ok(teamsRegex.test(teamsResult.meetingLink), `Link ${teamsResult.meetingLink} must match teamsRegex`);
  assert.strictEqual(teamsResult.meetingPassword, null, "Teams must return null password (never invented)");
  console.log(`✓ Microsoft Teams successfully generated link: ${teamsResult.meetingLink}`);
  console.log(`✓ Microsoft Teams password correctly handled as null without error`);

  // 4. Zoom Provider Test: With password required
  console.log("\n[Test 1.4] Zoom generation with isMeetingPasswordRequired=true");
  setMockProviderHandler(async ({ platform, title, isMeetingPasswordRequired }) => {
    return {
      platform,
      meetingLink: "https://zoom.us/j/98765432101?pwd=securePassword123",
      providerMeetingId: "98765432101",
      meetingPassword: isMeetingPasswordRequired ? "securePassword123" : null
    };
  });

  const zoomWithPass = await generateMeetingFromProvider({
    platform: MeetingPlatformTypes.ZOOM,
    title: "Client Demo",
    isMeetingPasswordRequired: true
  });

  assert.strictEqual(zoomWithPass.success, true, "Zoom creation should succeed");
  assert.ok(zoomMeetRegex.test(zoomWithPass.meetingLink), `Link ${zoomWithPass.meetingLink} must match zoomMeetRegex`);
  assert.strictEqual(zoomWithPass.meetingPassword, "securePassword123", "Zoom must return actual provider password");
  console.log(`✓ Zoom generated link: ${zoomWithPass.meetingLink} with password: ${zoomWithPass.meetingPassword}`);

  // 5. Zoom Provider Test: Without password required
  console.log("\n[Test 1.5] Zoom generation with isMeetingPasswordRequired=false");
  const zoomWithoutPass = await generateMeetingFromProvider({
    platform: MeetingPlatformTypes.ZOOM,
    title: "Open Q&A",
    isMeetingPasswordRequired: false
  });
  assert.strictEqual(zoomWithoutPass.success, true, "Zoom creation should succeed");
  assert.strictEqual(zoomWithoutPass.meetingPassword, null, "Zoom password is null when not requested");
  console.log(`✓ Zoom generated link: ${zoomWithoutPass.meetingLink} without password`);

  // 6. Timeout handling test (Simulate provider call taking longer than timeout)
  console.log("\n[Test 1.6] Provider Timeout handling");
  setMockProviderHandler(async () => {
    // Deliberately sleep for 5000ms (exceeds 4000ms default timeout)
    await new Promise((r) => setTimeout(r, 4500));
    return { meetingLink: "https://meet.google.com/abc-defg-hij" };
  });

  const timeoutResult = await generateMeetingFromProvider({
    platform: MeetingPlatformTypes.GOOGLE_MEET,
    title: "Timeout Test"
  });

  assert.strictEqual(timeoutResult.success, false, "Timeout must result in failure");
  assert.strictEqual(timeoutResult.isTimeout, true, "Must flag isTimeout=true");
  assert.strictEqual(timeoutResult.action, "RETRY_OR_MANUAL_LINK", "Must offer RETRY_OR_MANUAL_LINK");
  assert.strictEqual(timeoutResult.fallbackAvailable, true, "Must flag fallbackAvailable=true");
  assert.ok(timeoutResult.message.includes("timed out"), `Message must mention timeout: ${timeoutResult.message}`);
  console.log(`✓ Timeout handled correctly: "${timeoutResult.message}"`);

  // 7. Temporary Unavailability / 503 Provider Error Test
  console.log("\n[Test 1.7] Provider Temporary Unavailability handling");
  setMockProviderHandler(async () => {
    const error = new Error("Teams service gateway response error: 503 Service Unavailable");
    error.response = { status: 503, data: { error: { message: "Server overloaded" } } };
    throw error;
  });

  const unavailResult = await generateMeetingFromProvider({
    platform: MeetingPlatformTypes.TEAMS,
    title: "Unavailability Test"
  });

  assert.strictEqual(unavailResult.success, false, "Unavailable provider must return failure");
  assert.strictEqual(unavailResult.isUnavailable, true, "Must flag isUnavailable=true");
  assert.strictEqual(unavailResult.action, "RETRY_OR_MANUAL_LINK", "Must offer retry or manual link");
  assert.strictEqual(unavailResult.fallbackAvailable, true, "Must flag fallbackAvailable=true");
  assert.ok(unavailResult.message.includes("temporarily unavailable") || unavailResult.message.includes("Server overloaded"), `Message must be actionable: ${unavailResult.message}`);
  console.log(`✓ Provider unavailability handled correctly: "${unavailResult.message}"`);

  // 8. Unsupported platform check
  console.log("\n[Test 1.8] Unsupported platform handling");
  resetMockProviderHandler();
  const unsuppResult = await generateMeetingFromProvider({
    platform: "OTHER",
    title: "Other Platform"
  });
  assert.strictEqual(unsuppResult.success, false);
  assert.ok(unsuppResult.message.includes("Automatic meeting creation is not supported"));
  console.log(`✓ Unsupported platform correctly rejected: "${unsuppResult.message}"`);

  resetMockProviderHandler();
  console.log("\n✅ ALL PROVIDER UNIT TESTS PASSED!");
  return true;
};

module.exports = { runProviderTests };

if (require.main === module) {
  runProviderTests().then(() => process.exit(0)).catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
}
