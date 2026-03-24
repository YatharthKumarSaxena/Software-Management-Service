// controllers/activity-trackers/index.js

const { getMyActivityController } = require("./get-my-activity.controller");
const { listActivityController } = require("./list-activity.controller");
const { getActivityController } = require("./get-activity.controller");

const activityTrackerControllers = {
  getMyActivityController,
  listActivityController,
  getActivityController,
};

module.exports = { activityTrackerControllers };
