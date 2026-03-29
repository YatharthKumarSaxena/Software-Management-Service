const { createMeetingController } = require("./create-meeting.controller");
const { getMeetingController } = require("./get-meeting.controller");
const { listMeetingsController } = require("./list-meetings.controller");
const { updateMeetingController } = require("./update-meeting.controller");
const { cancelMeetingController } = require("./cancel-meeting.controller");

const meetingControllers = {
  createMeetingController,
  getMeetingController,
  listMeetingsController,
  updateMeetingController,
  cancelMeetingController
};

module.exports = {
  meetingControllers
}
