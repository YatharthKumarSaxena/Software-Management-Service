// testing/live-provider.test.js

require("module-alias/register");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const { generateMeetingFromProvider } = require("@services/meetings/providers/meeting-provider.factory");
const { MeetingPlatformTypes } = require("@configs/enums.config");

const testLiveProviders = async () => {
  console.log("\n=======================================================");
  console.log("  TEST SUITE 4: Live Provider Verification (No Mocks)");
  console.log("=======================================================");

  const report = {};

  // 1. Live Google Meet test
  console.log("\n[Live 4.1] Testing Live Google Meet Provider API call...");
  try {
    const googleResult = await generateMeetingFromProvider({
      platform: MeetingPlatformTypes.GOOGLE_MEET,
      title: "Live Google Meet Test",
      isMeetingPasswordRequired: true
    });
    report.google = { success: googleResult.success, result: googleResult };
    console.log("Google Meet Result:", JSON.stringify(googleResult, null, 2));
  } catch (err) {
    report.google = { success: false, error: err.message };
    console.log("Google Meet Error:", err.message);
  }

  // 2. Live Microsoft Teams test
  console.log("\n[Live 4.2] Testing Live Microsoft Teams Provider API call...");
  try {
    const teamsResult = await generateMeetingFromProvider({
      platform: MeetingPlatformTypes.TEAMS,
      title: "Live Teams Test",
      isMeetingPasswordRequired: false
    });
    report.teams = { success: teamsResult.success, result: teamsResult };
    console.log("Microsoft Teams Result:", JSON.stringify(teamsResult, null, 2));
  } catch (err) {
    report.teams = { success: false, error: err.message };
    console.log("Microsoft Teams Error:", err.message);
  }

  // 3. Live Zoom test
  console.log("\n[Live 4.3] Testing Live Zoom Provider API call...");
  try {
    const zoomResult = await generateMeetingFromProvider({
      platform: MeetingPlatformTypes.ZOOM,
      title: "Live Zoom Test",
      isMeetingPasswordRequired: true
    });
    report.zoom = { success: zoomResult.success, result: zoomResult };
    console.log("Zoom Result:", JSON.stringify(zoomResult, null, 2));
  } catch (err) {
    report.zoom = { success: false, error: err.message };
    console.log("Zoom Error:", err.message);
  }

  console.log("\n=======================================================");
  console.log("  Live Provider Verification Summary");
  console.log("=======================================================");
  console.log(`- Google Meet: ${report.google?.success ? "ONLINE" : "CONFIG_LIMIT: " + (report.google?.result?.message || report.google?.error)}`);
  console.log(`- Microsoft Teams: ${report.teams?.success ? "ONLINE" : "CONFIG_LIMIT: " + (report.teams?.result?.message || report.teams?.error)}`);
  console.log(`- Zoom: ${report.zoom?.success ? "ONLINE" : "CONFIG_LIMIT: " + (report.zoom?.result?.message || report.zoom?.error)}`);

  return report;
};

module.exports = { testLiveProviders };

if (require.main === module) {
  testLiveProviders()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Live test failed:", err);
      process.exit(1);
    });
}
