// testing/meeting-routes.test.js

require("module-alias/register");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const assert = require("assert");
const express = require("express");
const axios = require("axios");
const http = require("http");
const { meetingControllers } = require("@/controllers/meetings");
const { meetingMiddlewares } = require("@/middlewares/meetings");
const { projectMiddlewares } = require("@/middlewares/projects");
const { stakeholderMiddlewares } = require("@/middlewares/stakeholders");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");
const { MeetingModel } = require("@models/meeting.model");
const {
  setMockProviderHandler,
  resetMockProviderHandler
} = require("@services/meetings/providers/meeting-provider.factory");
const {
  connectDB,
  disconnectDB,
  createTestSeedData,
  cleanupTestData,
  TEST_ADMIN_ID,
  TEST_DEVICE_UUID
} = require("./test-helpers");
const { MeetingPlatformTypes, MeetingStatuses } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");

const runRouteTests = async () => {
  console.log("\n=======================================================");
  console.log("  TEST SUITE 3: HTTP Route & Controller Tests");
  console.log("=======================================================");

  await connectDB();
  const seed = await createTestSeedData();
  const { project, elicitation } = seed;

  // Create an express test app with necessary business middlewares & controllers
  const app = express();
  app.use(express.json());

  // Inject authentication and request context into req
  app.use((req, res, next) => {
    req.admin = {
      adminId: TEST_ADMIN_ID,
      role: "CEO"
    };
    req.userId = TEST_ADMIN_ID;
    req.device = {
      deviceUUID: TEST_DEVICE_UUID
    };
    req.requestId = "22222222-3333-4444-8555-666666666666";
    next();
  });

  const testMeetingRouter = express.Router();

  // 1. Auto Create Meeting
  testMeetingRouter.post(
    "/create-auto/:entityType/:projectId",
    [
      projectMiddlewares.fetchProjectMiddleware,
      projectMiddlewares.activeProjectGuardMiddleware,
      stakeholderMiddlewares.checkUserIsStakeholder,
      stakeholderRoleAccessMiddlewares.createMeetingStakeholderRoleAccessMiddleware,
      meetingMiddlewares.fetchEntityIdMiddleware,
      meetingMiddlewares.createAutoMeetingPresenceMiddleware,
      meetingMiddlewares.createAutoMeetingValidationMiddleware
    ],
    meetingControllers.createAutoMeetingController
  );

  // 2. Regenerate Meeting Link
  testMeetingRouter.patch(
    "/regenerate-link/:entityType/:meetingId",
    [
      meetingMiddlewares.fetchMeetingMiddleware,
      meetingMiddlewares.meetingFinalizedGuardMiddleware,
      projectMiddlewares.fetchProjectMiddleware,
      stakeholderMiddlewares.checkUserIsStakeholder,
      projectMiddlewares.activeProjectGuardMiddleware,
      meetingMiddlewares.fetchEntityIdMiddleware,
      meetingMiddlewares.validateUserIsParticipantMiddleware,
      meetingMiddlewares.regenerateMeetingLinkPresenceMiddleware,
      meetingMiddlewares.regenerateMeetingLinkValidationMiddleware
    ],
    meetingControllers.regenerateMeetingLinkController
  );

  // 3. Existing Create Meeting Route (verifying unchanged preservation)
  testMeetingRouter.post(
    "/create/:entityType/:projectId",
    [
      projectMiddlewares.fetchProjectMiddleware,
      projectMiddlewares.activeProjectGuardMiddleware,
      stakeholderMiddlewares.checkUserIsStakeholder,
      stakeholderRoleAccessMiddlewares.createMeetingStakeholderRoleAccessMiddleware,
      meetingMiddlewares.fetchEntityIdMiddleware,
      meetingMiddlewares.createMeetingPresenceMiddleware,
      meetingMiddlewares.createMeetingValidationMiddleware
    ],
    meetingControllers.createMeetingController
  );

  // Mount test router under the standard prefix
  app.use("/software-management-service/api/v1/meetings", testMeetingRouter);

  // Start test server on random port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/software-management-service/api/v1/meetings`;

  // Set default headers for all axios test requests
  axios.defaults.headers.common["x-device-uuid"] = TEST_DEVICE_UUID;

  try {
    // ── 3.1 Test Auto Create Meeting Route (Google Meet) ──────────────
    console.log("\n[Test 3.1] POST /create-auto/:entityType/:projectId - Google Meet (201 Created)");
    setMockProviderHandler(async ({ platform }) => ({
      platform,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      meetingPassword: null,
      passwordNote: "Google Meet does not support passwords."
    }));

    const createAutoRes = await axios.post(
      `${baseUrl}/create-auto/${DB_COLLECTIONS.ELICITATIONS}/${project._id}`,
      {
        title: "Sprint Planning Meeting",
        description: "Auto sprint planning",
        platform: MeetingPlatformTypes.GOOGLE_MEET,
        isMeetingPasswordRequired: true
      }
    );

    assert.strictEqual(createAutoRes.status, 201, "Expected 201 Created");
    assert.strictEqual(createAutoRes.data.success, true);
    assert.strictEqual(createAutoRes.data.data.meeting.title, "Sprint Planning Meeting");
    assert.strictEqual(createAutoRes.data.data.meeting.meetingLink, "https://meet.google.com/abc-defg-hij");
    assert.strictEqual(createAutoRes.data.data.meeting.meetingPassword, null);
    assert.ok(createAutoRes.data.data.passwordNote, "Expected passwordNote for Google Meet");
    const createdMeetingId = createAutoRes.data.data.meeting._id;
    console.log(`✓ POST /create-auto returned 201 Created with meeting ID: ${createdMeetingId}`);

    // ── 3.2 Test Auto Create Meeting Provider Timeout (504 Gateway Timeout)
    console.log("\n[Test 3.2] POST /create-auto/:entityType/:projectId - Provider Timeout (504 Gateway Timeout)");
    setMockProviderHandler(async () => {
      const err = new Error("Provider timeout simulated");
      err.isTimeout = true;
      throw err;
    });

    try {
      await axios.post(
        `${baseUrl}/create-auto/${DB_COLLECTIONS.ELICITATIONS}/${project._id}`,
        {
          title: "Timeout Auto Meeting",
          platform: MeetingPlatformTypes.GOOGLE_MEET
        }
      );
      assert.fail("Should have thrown 504");
    } catch (err) {
      assert.strictEqual(err.response.status, 504, "Expected 504 Gateway Timeout on provider timeout");
      assert.strictEqual(err.response.data.success, false);
      assert.strictEqual(err.response.data.type, "ProviderTimeout");
      assert.strictEqual(err.response.data.action, "RETRY_OR_MANUAL_LINK");
      assert.strictEqual(err.response.data.fallbackAvailable, true);
      assert.ok(err.response.data.message.includes("timed out"));
      console.log(`✓ POST /create-auto returned 504 Gateway Timeout: "${err.response.data.message}"`);
    }

    // ── 3.3 Test Auto Create Meeting Provider Unavailable (503 Service Unavailable)
    console.log("\n[Test 3.3] POST /create-auto/:entityType/:projectId - Provider Unavailable (503 Service Unavailable)");
    setMockProviderHandler(async () => {
      const err = new Error("Zoom outage");
      err.response = { status: 503, data: { message: "Zoom API currently down" } };
      throw err;
    });

    try {
      await axios.post(
        `${baseUrl}/create-auto/${DB_COLLECTIONS.ELICITATIONS}/${project._id}`,
        {
          title: "Outage Auto Meeting",
          platform: MeetingPlatformTypes.ZOOM
        }
      );
      assert.fail("Should have thrown 503");
    } catch (err) {
      assert.strictEqual(err.response.status, 503, "Expected 503 Service Unavailable");
      assert.strictEqual(err.response.data.success, false);
      assert.strictEqual(err.response.data.type, "ProviderUnavailable");
      assert.strictEqual(err.response.data.action, "RETRY_OR_MANUAL_LINK");
      assert.strictEqual(err.response.data.fallbackAvailable, true);
      console.log(`✓ POST /create-auto returned 503 Service Unavailable: "${err.response.data.message}"`);
    }

    // ── 3.4 Test Auto Create Meeting Missing Title Validation (400 Bad Request)
    console.log("\n[Test 3.4] POST /create-auto/:entityType/:projectId - Missing title (400 Bad Request)");
    try {
      await axios.post(
        `${baseUrl}/create-auto/${DB_COLLECTIONS.ELICITATIONS}/${project._id}`,
        {
          description: "Missing required title"
        }
      );
      assert.fail("Should have thrown 400");
    } catch (err) {
      assert.strictEqual(err.response.status, 400, "Expected 400 Bad Request when title missing");
      assert.strictEqual(err.response.data.success, false);
      console.log(`✓ POST /create-auto missing title returned 400 Bad Request`);
    }

    // ── 3.5 Test Regenerate Meeting Link Route (200 OK) ────────────────
    console.log("\n[Test 3.5] PATCH /regenerate-link/:entityType/:meetingId - Success (200 OK)");
    setMockProviderHandler(async ({ platform, isMeetingPasswordRequired }) => ({
      platform,
      meetingLink: "https://meet.google.com/uvw-xyza-bcd",
      meetingPassword: null
    }));

    const regenRes = await axios.patch(
      `${baseUrl}/regenerate-link/${DB_COLLECTIONS.ELICITATIONS}/${createdMeetingId}`,
      {
        isMeetingPasswordRequired: false
      }
    );

    assert.strictEqual(regenRes.status, 200, "Expected 200 OK");
    assert.strictEqual(regenRes.data.success, true);
    assert.strictEqual(regenRes.data.data.meeting.meetingLink, "https://meet.google.com/uvw-xyza-bcd");
    assert.strictEqual(regenRes.data.data.meeting._id, createdMeetingId);
    console.log(`✓ PATCH /regenerate-link returned 200 OK with new link: ${regenRes.data.data.meeting.meetingLink}`);

    // ── 3.6 Test Regenerate Meeting Link on CANCELLED Meeting (409 Conflict)
    console.log("\n[Test 3.6] PATCH /regenerate-link/:entityType/:meetingId - CANCELLED meeting (409 Conflict)");
    await MeetingModel.findByIdAndUpdate(createdMeetingId, { status: MeetingStatuses.CANCELLED });

    try {
      await axios.patch(
        `${baseUrl}/regenerate-link/${DB_COLLECTIONS.ELICITATIONS}/${createdMeetingId}`,
        {}
      );
      assert.fail("Should have thrown 409 Conflict");
    } catch (err) {
      assert.strictEqual(err.response.status, 409, "Expected 409 Conflict for finalized meeting");
      console.log(`✓ PATCH /regenerate-link returned 409 Conflict: "${err.response.data.message}"`);
    }

    // ── 3.7 Test Regenerate Meeting Link Timeout (504 Gateway Timeout) ─
    console.log("\n[Test 3.7] PATCH /regenerate-link/:entityType/:meetingId - Timeout (504 Gateway Timeout)");
    // Reset meeting back to DRAFT for timeout test
    await MeetingModel.findByIdAndUpdate(createdMeetingId, { status: MeetingStatuses.DRAFT });
    setMockProviderHandler(async () => {
      const err = new Error("Regeneration timeout");
      err.isTimeout = true;
      throw err;
    });

    try {
      await axios.patch(
        `${baseUrl}/regenerate-link/${DB_COLLECTIONS.ELICITATIONS}/${createdMeetingId}`,
        {}
      );
      assert.fail("Should have thrown 504");
    } catch (err) {
      assert.strictEqual(err.response.status, 504, "Expected 504 Gateway Timeout on regeneration timeout");
      assert.strictEqual(err.response.data.action, "RETRY_OR_MANUAL_LINK");
      console.log(`✓ PATCH /regenerate-link returned 504 Gateway Timeout on timeout`);
    }

    // ── 3.8 Strictly Preserve Existing Create Meeting Route ────────────
    console.log("\n[Test 3.8] Strictly preserve existing POST /create/:entityType/:projectId");
    const existingCreateRes = await axios.post(
      `${baseUrl}/create/${DB_COLLECTIONS.ELICITATIONS}/${project._id}`,
      {
        title: "Standard Manual Meeting",
        description: "Testing that existing Create Meeting API behaves 100% unchanged",
        meetingGroup: "GENERAL",
        platform: MeetingPlatformTypes.GOOGLE_MEET
      }
    );

    assert.strictEqual(existingCreateRes.status, 201, "Expected 201 Created from existing Create Meeting");
    assert.strictEqual(existingCreateRes.data.success, true);
    assert.strictEqual(existingCreateRes.data.data.meeting.title, "Standard Manual Meeting");
    assert.strictEqual(existingCreateRes.data.data.meeting.status, MeetingStatuses.DRAFT);
    assert.strictEqual(existingCreateRes.data.data.meeting.meetingLink, null);
    console.log(`✓ Existing Create Meeting route verified: status 201, meetingLink: null, behavior preserved intact`);

    resetMockProviderHandler();
    console.log("\n✅ ALL HTTP ROUTE & CONTROLLER TESTS PASSED!");
    return true;

  } finally {
    resetMockProviderHandler();
    server.close();
    await cleanupTestData(project._id);
    await disconnectDB();
  }
};

module.exports = { runRouteTests };

if (require.main === module) {
  runRouteTests().then(() => process.exit(0)).catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
}
