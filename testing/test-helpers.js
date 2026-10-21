// testing/test-helpers.js

require("module-alias/register");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { DB_URL } = require("@configs/db.config");
const { ProjectModel } = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { MeetingModel } = require("@models/meeting.model");
const { AdminModel } = require("@models/admin.model");
const { ProjectRoleTypes, Phases, AdminRoleTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { secretCodeOfAccessToken, secretCodeOfRefreshToken } = require("@configs/token.config");
const { buildRedisKey } = require("@/internals/redis-session/redis.key.builder");
const { getRedisClient } = require("@/utils/redis-client.util");

const TEST_ADMIN_ID = "USR1100000";
const TEST_FACILITATOR_ID = "USR1100001";
const TEST_DEVICE_UUID = "8fce1b10-45e3-4a87-93d6-b4c1f2e3cd9b";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DB_URL);
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

/**
 * Creates seed project, stakeholders, and elicitation entity for meeting tests.
 */
const createTestSeedData = async (options = {}) => {
  await connectDB();

  // Create Project
  const randomSuffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const project = new ProjectModel({
    name: `Auto Meeting Test Project ${randomSuffix}`,
    description: "Testing automatic meeting APIs and link regeneration in the software management service",
    problemStatement: "Need to automatically generate provider meeting links and regenerate links seamlessly",
    goal: "Achieve robust automatic meeting scheduling and link regeneration across providers",
    projectCategory: "individual",
    sequence: Math.floor(Math.random() * 100000) + 1,
    id: `PRJ${Math.floor(Math.random() * 9000000) + 1000000}`,
    currentPhase: Phases.ELICITATION || Phases.ELICITATIONS,
    projectCreationReasonType: "new_feature",
    ownerId: TEST_ADMIN_ID,
    createdBy: TEST_ADMIN_ID,
    ...options.projectOverrides
  });
  await project.save();

  // Create Owner Stakeholder
  const ownerStakeholder = new StakeholderModel({
    projectId: project._id,
    userId: TEST_ADMIN_ID,
    stakeholderId: TEST_ADMIN_ID,
    role: ProjectRoleTypes.OWNER,
    createdBy: TEST_ADMIN_ID
  });
  await ownerStakeholder.save();

  // Create Facilitator Stakeholder
  const facilitatorStakeholder = new StakeholderModel({
    projectId: project._id,
    userId: TEST_FACILITATOR_ID,
    stakeholderId: TEST_FACILITATOR_ID,
    role: ProjectRoleTypes.MANAGER,
    createdBy: TEST_ADMIN_ID
  });
  await facilitatorStakeholder.save();

  // Create Parent Elicitation Entity
  const elicitation = new ElicitationModel({
    projectId: project._id,
    phaseNumber: 1,
    minorVersion: 0,
    allowParallelMeetings: options.allowParallelMeetings !== undefined ? options.allowParallelMeetings : true,
    createdBy: TEST_ADMIN_ID,
    meetingIds: []
  });
  await elicitation.save();

  // Create or verify Admin in DB
  let admin = await AdminModel.findOne({ adminId: TEST_ADMIN_ID });
  if (!admin) {
    admin = new AdminModel({
      adminId: TEST_ADMIN_ID,
      role: AdminRoleTypes.CEO,
      firstName: "TestAdmin",
      isActive: true,
      isBlocked: false,
      isDeleted: false,
      isSuspended: false
    });
    await admin.save();
  }

  // Generate JWT and create Redis session
  const accessToken = jwt.sign(
    { uid: TEST_ADMIN_ID, did: TEST_DEVICE_UUID },
    secretCodeOfAccessToken,
    { expiresIn: "2h" }
  );
  const refreshToken = jwt.sign(
    { uid: TEST_ADMIN_ID, did: TEST_DEVICE_UUID },
    secretCodeOfRefreshToken,
    { expiresIn: "7d" }
  );

  const redisClient = getRedisClient();
  const redisKey = buildRedisKey(TEST_ADMIN_ID, TEST_DEVICE_UUID);
  await redisClient.set(redisKey, JSON.stringify({ refreshToken }));

  return {
    project,
    ownerStakeholder,
    facilitatorStakeholder,
    elicitation,
    admin,
    adminId: TEST_ADMIN_ID,
    facilitatorId: TEST_FACILITATOR_ID,
    deviceUUID: TEST_DEVICE_UUID,
    accessToken,
    refreshToken
  };
};

/**
 * Cleans up documents created during tests.
 */
const cleanupTestData = async (projectId) => {
  if (projectId) {
    await MeetingModel.deleteMany({ projectId });
    await ElicitationModel.deleteMany({ projectId });
    await StakeholderModel.deleteMany({ projectId });
    await ProjectModel.findByIdAndDelete(projectId);
  }
  try {
    const redisClient = getRedisClient();
    const redisKey = buildRedisKey(TEST_ADMIN_ID, TEST_DEVICE_UUID);
    await redisClient.del(redisKey);
  } catch (e) {
    // ignore
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  createTestSeedData,
  cleanupTestData,
  TEST_ADMIN_ID,
  TEST_FACILITATOR_ID,
  TEST_DEVICE_UUID
};
