const { createMeetingController } = require("./create-meeting.controller");
const { createAutoMeetingController } = require("./create-auto-meeting.controller");
const { regenerateMeetingLinkController } = require("./regenerate-meeting-link.controller");
const { getMeetingController } = require("./get-meeting.controller");
const { listMeetingsController } = require("./list-meetings.controller");
const { updateMeetingController } = require("./update-meeting.controller");
const { cancelMeetingController } = require("./cancel-meeting.controller");
const { scheduleMeetingController } = require("./schedule-meeting.controller");
const { rescheduleMeetingController } = require("./reschedule-meeting.controller");
const { startMeetingController } = require("./start-meeting.controller");
const { endMeetingController } = require("./end-meeting.controller");
const { freezeMeetingController } = require("./freeze-meeting.controller");

const meetingControllers = {
  createMeetingController,
  createAutoMeetingController,
  regenerateMeetingLinkController,
  getMeetingController,
  listMeetingsController,
  updateMeetingController,
  cancelMeetingController,
  scheduleMeetingController,
  rescheduleMeetingController,
  startMeetingController,
  endMeetingController,
  freezeMeetingController
};

module.exports = {
  meetingControllers
}
