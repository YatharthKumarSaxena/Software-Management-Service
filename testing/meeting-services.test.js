// testing/meeting-services.test.js

require("module-alias/register");
const assert = require("assert");
const { MeetingModel } = require("@models/meeting.model");
const { createMeetingService } = require("@services/meetings/create-meeting.service");
const { createAutoMeetingService } = require("@services/meetings/create-auto-meeting.service");
const { regenerateMeetingLinkService } = require("@services/meetings/regenerate-meeting-link.service");
const { setMockProviderHandler, resetMockProviderHandler } = require("@services/meetings/providers/meeting-provider.factory");
const { MeetingPlatformTypes, MeetingStatuses } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const {
  connectDB,
  disconnectDB,
  createTestSeedData,
  cleanupTestData,
  TEST_ADMIN_ID,
  TEST_FACILITATOR_ID,
  TEST_DEVICE_UUID
} = require("./test-helpers");

const runServiceTests = async () => {
  console.log("\n=======================================================");
  console.log("  TEST SUITE 2: Meeting Services & Persistence Tests");
  console.log("=======================================================");

  await connectDB();
  const seed = await createTestSeedData();
  const { project, elicitation } = seed;
  const auditContext = {
    user: { adminId: TEST_ADMIN_ID, role: "CEO" },
    device: { deviceUUID: TEST_DEVICE_UUID },
    requestId: "11111111-2222-4333-8444-555555555555"
  };

  try {
    // ── 1. Strictly preserve existing Create Meeting API ───────────────
    console.log("\n[Test 2.1] Strictly preserve existing Create Meeting API");
    const originalCreateResult = await createMeetingService({
      parentEntity: elicitation,
      entityType: DB_COLLECTIONS.ELICITATIONS,
      project,
      title: "Existing Manual Create Meeting",
      facilitatorId: TEST_ADMIN_ID,
      description: "Original meeting creation description",
      meetingGroup: "GENERAL",
      platform: MeetingPlatformTypes.GOOGLE_MEET,
      createdBy: TEST_ADMIN_ID,
      auditContext
    });

    assert.strictEqual(originalCreateResult.success, true, "Original Create Meeting API must succeed");
    assert.strictEqual(originalCreateResult.meeting.title, "Existing Manual Create Meeting");
    assert.strictEqual(originalCreateResult.meeting.status, MeetingStatuses.DRAFT, "Original meeting status must be DRAFT");
    assert.strictEqual(originalCreateResult.meeting.meetingLink, null, "Original meeting link must be null");
    assert.strictEqual(originalCreateResult.meeting.participants.length, 1, "Facilitator must be added as participant");

    const manualMeetingInDb = await MeetingModel.findById(originalCreateResult.meeting._id);
    assert.ok(manualMeetingInDb, "Meeting must be found in MongoDB");
    console.log(`✓ Original Create Meeting API preserved and verified (ID: ${manualMeetingInDb._id})`);

    // ── 2. Automatic Create Meeting with Google Meet ───────────────────
    console.log("\n[Test 2.2] Automatic Create Meeting - Google Meet (MongoDB persistence)");
    setMockProviderHandler(async ({ platform, title }) => ({
      platform,
      meetingLink: "https://meet.google.com/xyz-uvwx-rst",
      meetingPassword: null,
      passwordNote: "Google Meet does not support meeting passwords."
    }));

    const autoGoogleResult = await createAutoMeetingService({
      parentEntity: elicitation,
      entityType: DB_COLLECTIONS.ELICITATIONS,
      project,
      title: "Auto Google Meet Meeting",
      description: "Auto meeting agenda",
      facilitatorId: TEST_FACILITATOR_ID,
      platform: MeetingPlatformTypes.GOOGLE_MEET,
      isMeetingPasswordRequired: true,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      expectedDuration: 45,
      createdBy: TEST_ADMIN_ID,
      auditContext
    });

    assert.strictEqual(autoGoogleResult.success, true, "Auto Google Meet creation must succeed");
    assert.strictEqual(autoGoogleResult.meeting.meetingLink, "https://meet.google.com/xyz-uvwx-rst");
    assert.strictEqual(autoGoogleResult.meeting.meetingPassword, null, "Google Meet password must be null (never invented)");

    // Verify MongoDB persistence
    const googleMeetingInDb = await MeetingModel.findById(autoGoogleResult.meeting._id);
    assert.ok(googleMeetingInDb, "Google meeting must be persisted in DB");
    assert.strictEqual(googleMeetingInDb.meetingLink, "https://meet.google.com/xyz-uvwx-rst");
    assert.strictEqual(googleMeetingInDb.meetingPassword, null);
    assert.strictEqual(googleMeetingInDb.expectedDuration, 45);
    console.log(`✓ Google Meet auto-created and verified in MongoDB (ID: ${googleMeetingInDb._id})`);

    // ── 3. Automatic Create Meeting with Zoom (Password persisted) ─────
    console.log("\n[Test 2.3] Automatic Create Meeting - Zoom with password");
    setMockProviderHandler(async ({ platform, isMeetingPasswordRequired }) => ({
      platform,
      meetingLink: "https://zoom.us/j/1234567890?pwd=ZoomSecretPassword456",
      providerMeetingId: "1234567890",
      meetingPassword: isMeetingPasswordRequired ? "ZoomSecretPassword456" : null
    }));

    const autoZoomResult = await createAutoMeetingService({
      parentEntity: elicitation,
      entityType: DB_COLLECTIONS.ELICITATIONS,
      project,
      title: "Auto Zoom Meeting",
      agenda: "Sprint Architecture Demo",
      platform: MeetingPlatformTypes.ZOOM,
      isMeetingPasswordRequired: true,
      createdBy: TEST_ADMIN_ID,
      auditContext
    });

    assert.strictEqual(autoZoomResult.success, true);
    assert.strictEqual(autoZoomResult.meeting.meetingLink, "https://zoom.us/j/1234567890?pwd=ZoomSecretPassword456");
    assert.strictEqual(autoZoomResult.meeting.meetingPassword, "ZoomSecretPassword456");
    assert.strictEqual(autoZoomResult.meeting.description, "Sprint Architecture Demo");

    // Verify DB
    const zoomMeetingInDb = await MeetingModel.findById(autoZoomResult.meeting._id);
    assert.strictEqual(zoomMeetingInDb.meetingPassword, "ZoomSecretPassword456");
    console.log(`✓ Zoom meeting persisted with actual password in MongoDB (ID: ${zoomMeetingInDb._id})`);

    // ── 4. Automatic Create Meeting with Microsoft Teams ───────────────
    console.log("\n[Test 2.4] Automatic Create Meeting - Microsoft Teams");
    setMockProviderHandler(async ({ platform }) => ({
      platform,
      meetingLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_teams_test%40thread.v2/0",
      meetingPassword: null
    }));

    const autoTeamsResult = await createAutoMeetingService({
      parentEntity: elicitation,
      entityType: DB_COLLECTIONS.ELICITATIONS,
      project,
      title: "Auto Teams Meeting",
      platform: MeetingPlatformTypes.TEAMS,
      createdBy: TEST_ADMIN_ID,
      auditContext
    });

    assert.strictEqual(autoTeamsResult.success, true);
    assert.strictEqual(autoTeamsResult.meeting.meetingLink, "https://teams.microsoft.com/l/meetup-join/19%3ameeting_teams_test%40thread.v2/0");
    assert.strictEqual(autoTeamsResult.meeting.meetingPassword, null);
    console.log(`✓ Microsoft Teams meeting persisted in MongoDB (ID: ${autoTeamsResult.meeting._id})`);

    // ── 5. Provider failure safety: no duplicate/dangling meeting ──────
    console.log("\n[Test 2.5] Provider failure safety (No partial meeting left in DB)");
    setMockProviderHandler(async () => {
      const err = new Error("Provider network down");
      err.response = { status: 503, data: { message: "Network unavailable" } };
      throw err;
    });

    const meetingsCountBefore = await MeetingModel.countDocuments({ projectId: project._id });

    const failedCreateResult = await createAutoMeetingService({
      parentEntity: elicitation,
      entityType: DB_COLLECTIONS.ELICITATIONS,
      project,
      title: "Meeting That Must Fail Safely",
      platform: MeetingPlatformTypes.GOOGLE_MEET,
      createdBy: TEST_ADMIN_ID,
      auditContext
    });

    assert.strictEqual(failedCreateResult.success, false, "Must return failure");
    assert.strictEqual(failedCreateResult.isUnavailable, true, "Must flag isUnavailable");
    assert.strictEqual(failedCreateResult.action, "RETRY_OR_MANUAL_LINK");

    const meetingsCountAfter = await MeetingModel.countDocuments({ projectId: project._id });
    assert.strictEqual(meetingsCountAfter, meetingsCountBefore, "No dangling meeting document must be created in DB");
    console.log(`✓ Safety verified: Failure cleanly rejected without duplicate or dangling database records`);

    // ── 6. Regenerate Meeting Link API ────────────────────────────────
    console.log("\n[Test 2.6] Regenerate Meeting Link API - Update existing meeting");
    // Target the Zoom meeting created earlier
    const meetingToRegenerate = await MeetingModel.findById(autoZoomResult.meeting._id);
    const originalTitle = meetingToRegenerate.title;
    const originalFacilitator = meetingToRegenerate.facilitatorId;

    setMockProviderHandler(async ({ platform, isMeetingPasswordRequired }) => ({
      platform,
      meetingLink: "https://zoom.us/j/99988877766?pwd=BrandNewRegeneratedPassword789",
      meetingPassword: isMeetingPasswordRequired ? "BrandNewRegeneratedPassword789" : null
    }));

    // Call regenerate without providing title, agenda, or start time
    const regenResult = await regenerateMeetingLinkService(
      meetingToRegenerate,
      project,
      {
        isMeetingPasswordRequired: true,
        updatedBy: TEST_ADMIN_ID,
        auditContext
      }
    );

    assert.strictEqual(regenResult.success, true, "Regenerate meeting link must succeed");
    assert.strictEqual(regenResult.meeting._id.toString(), meetingToRegenerate._id.toString(), "Meeting ID must remain unchanged");
    assert.strictEqual(regenResult.meeting.title, originalTitle, "Meeting title must remain intact");
    assert.strictEqual(regenResult.meeting.facilitatorId, originalFacilitator, "Facilitator must remain intact");
    assert.strictEqual(regenResult.meeting.meetingLink, "https://zoom.us/j/99988877766?pwd=BrandNewRegeneratedPassword789", "Meeting link must be updated");
    assert.strictEqual(regenResult.meeting.meetingPassword, "BrandNewRegeneratedPassword789", "meetingPassword must be updated");

    // Verify MongoDB state
    const regeneratedInDb = await MeetingModel.findById(meetingToRegenerate._id);
    assert.strictEqual(regeneratedInDb.meetingLink, "https://zoom.us/j/99988877766?pwd=BrandNewRegeneratedPassword789");
    assert.strictEqual(regeneratedInDb.meetingPassword, "BrandNewRegeneratedPassword789");
    console.log(`✓ Meeting link regenerated and verified in MongoDB (New Link: ${regeneratedInDb.meetingLink})`);

    // ── 7. Regenerate Meeting Link: Rejection of Finalized Meetings ─────
    console.log("\n[Test 2.7] Regenerate Meeting Link rejection for CANCELLED/COMPLETED meetings");
    const cancelledMeeting = new MeetingModel({
      entityId: elicitation._id,
      projectId: project._id,
      entityType: DB_COLLECTIONS.ELICITATIONS,
      title: "Cancelled Meeting",
      facilitatorId: TEST_ADMIN_ID,
      platform: MeetingPlatformTypes.GOOGLE_MEET,
      status: MeetingStatuses.CANCELLED,
      createdBy: TEST_ADMIN_ID
    });
    await cancelledMeeting.save();

    const regenCancelledResult = await regenerateMeetingLinkService(
      cancelledMeeting,
      project,
      {
        updatedBy: TEST_ADMIN_ID,
        auditContext
      }
    );

    assert.strictEqual(regenCancelledResult.success, false, "Must reject regeneration for CANCELLED meeting");
    assert.ok(regenCancelledResult.message.includes("Cannot regenerate link"), "Error message must indicate blocked action");
    console.log(`✓ Cancelled meeting link regeneration correctly rejected: "${regenCancelledResult.message}"`);

    // ── 8. Regenerate failure safety: preserves existing DB record ──────
    console.log("\n[Test 2.8] Regenerate failure safety (Leaves existing record intact)");
    setMockProviderHandler(async () => {
      const err = new Error("Provider timeout");
      err.code = "ECONNABORTED";
      err.isTimeout = true;
      throw err;
    });

    const regenFailedResult = await regenerateMeetingLinkService(
      regeneratedInDb,
      project,
      {
        updatedBy: TEST_ADMIN_ID,
        auditContext
      }
    );

    assert.strictEqual(regenFailedResult.success, false);
    assert.strictEqual(regenFailedResult.isTimeout, true);

    const meetingAfterFailedRegen = await MeetingModel.findById(regeneratedInDb._id);
    assert.strictEqual(
      meetingAfterFailedRegen.meetingLink,
      "https://zoom.us/j/99988877766?pwd=BrandNewRegeneratedPassword789",
      "Existing meeting link must remain intact on regeneration failure"
    );
    console.log(`✓ Existing meeting record untouched on regeneration timeout`);

    resetMockProviderHandler();
    console.log("\n✅ ALL SERVICE & PERSISTENCE TESTS PASSED!");
    return true;

  } finally {
    resetMockProviderHandler();
    await cleanupTestData(project._id);
    await disconnectDB();
  }
};

module.exports = { runServiceTests };

if (require.main === module) {
  runServiceTests().then(() => process.exit(0)).catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
}
