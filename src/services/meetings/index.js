const { createMeetingService } = require("./create-meeting.service");
const { createAutoMeetingService } = require("./create-auto-meeting.service");
const { regenerateMeetingLinkService } = require("./regenerate-meeting-link.service");
const { updateMeetingService } = require("./update-meeting.service");
const { cancelMeetingService } = require("./cancel-meeting.service");
const { getMeetingService } = require("./get-meeting.service");
const { listMeetingsService } = require("./list-meetings.service");
const { scheduleMeetingService } = require("./schedule-meeting.service");
const { rescheduleMeetingService } = require("./reschedule-meeting.service");
const { startMeetingService } = require("./start-meeting.service");
const { endMeetingService } = require("./end-meeting.service");
const { freezeMeetingService } = require("./freeze-meeting.service");

module.exports = {
  createMeetingService,
  createAutoMeetingService,
  regenerateMeetingLinkService,
  updateMeetingService,
  cancelMeetingService,
  getMeetingService,
  listMeetingsService,
  scheduleMeetingService,
  rescheduleMeetingService,
  startMeetingService,
  endMeetingService,
  freezeMeetingService
};
