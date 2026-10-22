// testing/idea-ai-integration.test.js

require("module-alias/register");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const express = require("express");
const http = require("http");
const axios = require("axios");
const mongoose = require("mongoose");
const { connectDB, disconnectDB, TEST_ADMIN_ID } = require("./test-helpers");
const { ProjectModel } = require("@models/project.model");
const { InceptionModel } = require("@models/inception.model");
const { IdeaModel } = require("@models/idea.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { ideaServices } = require("@services/ideas");
const { aiModelServices } = require("@services/ai-model");
const { ideaControllers } = require("@controllers/ideas");
const { ideaMiddlewares } = require("@middlewares/ideas");
const { projectMiddlewares } = require("@middlewares/projects");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("\n=======================================================");
  console.log("  AI MODEL SERVICE & IDEA MODULE INTEGRATION TESTS");
  console.log("=======================================================");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = "") => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${details ? " - " + details : ""}`);
      failed++;
    }
  };

  let server = null;
  let serverPort = null;

  try {
    await connectDB();

    // ── Test 1: Direct Convert Content to English API with valid content ─────
    console.log("\n--- Suite 1: AI Model Service API Calls ---");
    const validConversion = await aiModelServices.convertContentToEnglishService({
      rawTitle: "Payment Gateway Ko Jodna",
      rawDescription: "Hum payment gateway integrate karna chahte hain jisse user easily online payment kar sake"
    });

    assert(validConversion.success === true, "convertContentToEnglishService succeeds with valid content");
    assert(validConversion.data?.need_clarification === false, "need_clarification is false for meaningful content");
    assert(typeof validConversion.data?.title === "string" && validConversion.data.title.length > 0, "title is converted to English");
    assert(typeof validConversion.data?.description === "string" && validConversion.data.description.length > 0, "description is converted to English");

    // ── Test 2: Direct Convert Content to English API with gibberish ──────────
    const gibberishConversion = await aiModelServices.convertContentToEnglishService({
      rawTitle: "asdfghjk qwerty",
      rawDescription: "ool;hjkhduiuuuiy7ye7878y hjdjbhjuimnhj"
    });

    assert(gibberishConversion.success === true, "convertContentToEnglishService succeeds processing gibberish");
    assert(gibberishConversion.data?.need_clarification === true, "need_clarification is true for gibberish/irrelevant content");

    // ── Test 3: Direct Classify Entity API ────────────────────────────────────
    const classificationRes = await aiModelServices.classifyEntityService({
      projectTitle: "Online Banking Platform",
      projectDescription: "A digital banking platform for managing customer accounts and financial transactions.",
      problemStatement: "Customers need secure and convenient access to banking services without visiting a physical branch.",
      projectGoal: "Provide secure digital banking services for customers.",
      projectType: "development",
      rawTitle: "Payment Gateway ko backend se integrate karna h",
      rawDescription: "Hum backend me payment gateway integrate karna chahte hain jisse payments process ho sake"
    });

    assert(classificationRes.success === true, "classifyEntityService succeeds");
    assert(typeof classificationRes.data?.entityType === "string", "classification returns entityType");
    assert(typeof classificationRes.data?.classScores === "object" && classificationRes.data.classScores !== null, "classification returns classScores summary");

    // ── Create Test Project & Inception for Service Tests ─────────────────────
    console.log("\n--- Suite 2: Idea Service Integration ---");
    const randomSuffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const testProject = new ProjectModel({
      name: `Payment System Project ${randomSuffix}`,
      description: "A comprehensive payment platform supporting multiple payment gateways and automated settlements.",
      problemStatement: "Customers face frequent checkout failures and delays when making online payments.",
      goal: "Provide 99.99% payment success rate and instant reconciliation across all transactions.",
      projectCategory: "individual",
      sequence: Math.floor(Math.random() * 100000) + 1,
      id: `PRJ${Math.floor(Math.random() * 9000000) + 1000000}`,
      currentPhase: ["inceptions"],
      projectCreationReasonType: "new_feature",
      ownerId: TEST_ADMIN_ID,
      createdBy: TEST_ADMIN_ID
    });
    await testProject.save();

    const testInception = new InceptionModel({
      projectId: testProject._id,
      productVision: "To be the most reliable and user-friendly digital payment gateway in the fintech industry.",
      createdBy: TEST_ADMIN_ID
    });
    await testInception.save();

    const auditContext = {
      user: { adminId: TEST_ADMIN_ID, role: "super_admin" },
      device: { uuid: "00000000-0000-4000-8000-000000000001" },
      requestId: "req-test-ai-1",
      workflowId: "wf-test-1"
    };

    // ── Test 4: createIdeaService with gibberish -> must reject ──────────────
    const gibberishCreateRes = await ideaServices.createIdeaService({
      projectId: testProject._id.toString(),
      rawTitle: "asdfghjk zxcvbnm",
      rawDescription: "ool;hjkhduiuuuiy7ye7878y hjdjbhjuimnhj",
      createdBy: TEST_ADMIN_ID,
      auditContext
    });

    assert(gibberishCreateRes.success === false, "createIdeaService rejects gibberish input");
    assert(gibberishCreateRes.errorCode === BAD_REQUEST, "createIdeaService returns BAD_REQUEST on need_clarification");

    const countGibberish = await IdeaModel.countDocuments({ projectId: testProject._id });
    assert(countGibberish === 0, "No idea document created in DB when clarification is needed");

    // ── Test 5: createIdeaService with meaningful content ────────────────────
    const validCreateRes = await ideaServices.createIdeaService({
      projectId: testProject._id.toString(),
      rawTitle: "Payment Gateway Ko Jodna",
      rawDescription: "Hum payment gateway integrate karna chahte hain jisse user bina rukawat payment kar sake",
      createdBy: TEST_ADMIN_ID,
      auditContext
    });

    assert(validCreateRes.success === true, "createIdeaService succeeds with meaningful content");
    assert(validCreateRes.idea?.rawTitle === "Payment Gateway Ko Jodna", "idea stores original rawTitle");
    assert(Boolean(validCreateRes.idea?.title), `idea stores English title: "${validCreateRes.idea?.title}"`);
    assert(Boolean(validCreateRes.idea?.description), `idea stores English description: "${validCreateRes.idea?.description}"`);

    // ── Test 6: Verify asynchronous classification updates the Idea document ─
    console.log("  Waiting for async classification to complete (up to 5s)...");
    let classifiedIdea = null;
    for (let i = 0; i < 10; i++) {
      await delay(500);
      classifiedIdea = await IdeaModel.findById(validCreateRes.idea._id);
      if (classifiedIdea?.aiPredictedClass && classifiedIdea?.aiPredictionSummary) {
        break;
      }
    }

    assert(Boolean(classifiedIdea?.aiPredictedClass), `aiPredictedClass populated asynchronously: ${classifiedIdea?.aiPredictedClass}`);
    assert(typeof classifiedIdea?.aiPredictionSummary === "object" && classifiedIdea?.aiPredictionSummary !== null, "aiPredictionSummary populated asynchronously with class scores");

    // ── Test 7: updateIdeaService with gibberish -> must reject ──────────────
    const gibberishUpdateRes = await ideaServices.updateIdeaService(
      classifiedIdea,
      {
        rawTitle: "zzzzxxxxx cccccvvvv",
        rawDescription: "12345678901234567890 utpatang description",
        updatedBy: TEST_ADMIN_ID,
        auditContext
      }
    );

    assert(gibberishUpdateRes.success === false, "updateIdeaService rejects gibberish input");
    assert(gibberishUpdateRes.errorCode === BAD_REQUEST, "updateIdeaService returns BAD_REQUEST when clarification is needed");

    const unchangedIdea = await IdeaModel.findById(classifiedIdea._id);
    assert(unchangedIdea.rawTitle === validCreateRes.idea.rawTitle, "Idea rawTitle remains unchanged after rejected update");

    // ── Test 8: updateIdeaService with valid content ─────────────────────────
    const validUpdateRes = await ideaServices.updateIdeaService(
      classifiedIdea,
      {
        rawTitle: "ATM Cash Nikalne Ki Suvidha",
        rawDescription: "Customer ATM se cash nikaal sake aur account se paise katne par receipt mile",
        updatedBy: TEST_ADMIN_ID,
        auditContext
      }
    );

    assert(validUpdateRes.success === true, "updateIdeaService succeeds with valid content");
    assert(validUpdateRes.idea?.rawTitle === "ATM Cash Nikalne Ki Suvidha", "Idea rawTitle updated");
    assert(Boolean(validUpdateRes.idea?.title), `Idea English title updated: "${validUpdateRes.idea?.title}"`);

    // ── Test 9: Verify async classification triggers after update ─────────────
    console.log("  Waiting for async classification on updated idea (up to 5s)...");
    let updatedClassifiedIdea = null;
    for (let i = 0; i < 10; i++) {
      await delay(500);
      updatedClassifiedIdea = await IdeaModel.findById(classifiedIdea._id);
      if (updatedClassifiedIdea?.aiPredictedClass) {
        break;
      }
    }

    assert(Boolean(updatedClassifiedIdea?.aiPredictedClass), `Updated idea re-classified asynchronously: ${updatedClassifiedIdea?.aiPredictedClass}`);
    assert(typeof updatedClassifiedIdea?.aiPredictionSummary === "object", "Updated idea has aiPredictionSummary");

    // ── Suite 3: HTTP Route & Controller Tests ────────────────────────────────
    console.log("\n--- Suite 3: HTTP Controller Tests ---");
    const app = express();
    app.use(express.json());

    // Inject mock auth context
    app.use((req, res, next) => {
      req.admin = { adminId: TEST_ADMIN_ID, role: "super_admin" };
      req.device = { uuid: "00000000-0000-4000-8000-000000000001", type: "laptop" };
      req.requestId = "req-test-route-1";
      next();
    });

    // Create idea route
    app.post(
      "/test/ideas/create/:projectId",
      ideaMiddlewares.createIdeaPresenceMiddleware,
      ideaMiddlewares.createIdeaValidationMiddleware,
      ideaControllers.createIdeaController
    );

    // Update idea route
    app.patch(
      "/test/ideas/update/:ideaId",
      ideaMiddlewares.fetchIdeaMiddleware,
      ideaMiddlewares.updateIdeaPresenceMiddleware,
      ideaMiddlewares.updateIdeaValidationMiddleware,
      ideaControllers.updateIdeaController
    );

    const testServer = http.createServer(app);
    await new Promise((resolve) => {
      testServer.listen(0, () => {
        serverPort = testServer.address().port;
        server = testServer;
        resolve();
      });
    });

    const client = axios.create({
      baseURL: `http://localhost:${serverPort}`,
      validateStatus: () => true
    });

    // HTTP Test 1: POST create idea with gibberish content -> 400
    const httpGibberishCreate = await client.post(`/test/ideas/create/${testProject._id}`, {
      rawTitle: "poiuytrewq lkjhgfds",
      rawDescription: "ool;hjkhduiuuuiy7ye7878y hjdjbhjuimnhj"
    });

    assert(httpGibberishCreate.status === 400, "HTTP POST create with gibberish returns 400 Bad Request");
    assert(httpGibberishCreate.data.success === false, "HTTP response has success: false");
    assert((httpGibberishCreate.data.warning || httpGibberishCreate.data.message).includes("relevant"), "HTTP error message prompts user for relevant content");

    // HTTP Test 2: POST create idea with valid content -> 201
    const httpValidCreate = await client.post(`/test/ideas/create/${testProject._id}`, {
      rawTitle: "Online Refund Process Karna",
      rawDescription: "Agar order cancel ho to user ko uska refund turant 2 din me mil jana chahiye"
    });

    assert(httpValidCreate.status === 201, "HTTP POST create with valid content returns 201 Created");
    assert(httpValidCreate.data.success === true, "HTTP response has success: true");
    assert(httpValidCreate.data.data.idea.rawTitle === "Online Refund Process Karna", "HTTP response includes rawTitle");
    assert(Boolean(httpValidCreate.data.data.idea.title), `HTTP response includes English title: "${httpValidCreate.data.data.idea.title}"`);
    assert(Boolean(httpValidCreate.data.data.idea.description), `HTTP response includes English description: "${httpValidCreate.data.data.idea.description}"`);

    const createdIdeaId = httpValidCreate.data.data.idea._id;

    // HTTP Test 3: Wait for async classification on HTTP created idea
    console.log("  Waiting for async classification on HTTP-created idea (up to 5s)...");
    let httpClassifiedIdea = null;
    for (let i = 0; i < 10; i++) {
      await delay(500);
      httpClassifiedIdea = await IdeaModel.findById(createdIdeaId);
      if (httpClassifiedIdea?.aiPredictedClass) {
        break;
      }
    }

    assert(Boolean(httpClassifiedIdea?.aiPredictedClass), `HTTP-created idea classified asynchronously: ${httpClassifiedIdea?.aiPredictedClass}`);
    assert(typeof httpClassifiedIdea?.aiPredictionSummary === "object", "HTTP-created idea has classScores in aiPredictionSummary");

    // HTTP Test 4: PATCH update idea with gibberish -> 400
    const httpGibberishUpdate = await client.patch(`/test/ideas/update/${createdIdeaId}`, {
      rawTitle: "qwertyuiop asdfghjkl",
      rawDescription: "utpatang description with more than ten chars"
    });

    assert(httpGibberishUpdate.status === 400, "HTTP PATCH update with gibberish returns 400 Bad Request");
    assert((httpGibberishUpdate.data.warning || httpGibberishUpdate.data.message).includes("relevant"), "HTTP error message asks for relevant content");

    // HTTP Test 5: PATCH update idea with valid content -> 200
    const httpValidUpdate = await client.patch(`/test/ideas/update/${createdIdeaId}`, {
      rawTitle: "Instant Refund System",
      rawDescription: "Immediate refund processing within 1 hour after return request approval"
    });

    assert(httpValidUpdate.status === 200, "HTTP PATCH update with valid content returns 200 OK");
    assert(httpValidUpdate.data.data.idea.rawTitle === "Instant Refund System", "HTTP response contains updated rawTitle");

    // ── Wait 2 seconds before cleanup so pending background promises finish ──
    await delay(2000);

    // ── Cleanup Test Data ────────────────────────────────────────────────────
    await IdeaModel.deleteMany({ projectId: testProject._id });
    await InceptionModel.deleteOne({ _id: testInception._id });
    await ProjectModel.deleteOne({ _id: testProject._id });

  } catch (err) {
    console.error("Unhandled error during tests:", err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await delay(1000);
    await disconnectDB();
  }

  console.log("\n=======================================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
