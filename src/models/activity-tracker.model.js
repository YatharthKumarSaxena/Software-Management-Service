const mongoose = require("mongoose");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { DeviceTypes, AdminTypes, PerformedOnTypes } = require("@configs/enums.config");
const { adminIdRegex, UUID_V4_REGEX } = require("@configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

const activityTrackerSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    match: adminIdRegex,
    index: true
  },

  eventType: {
    type: String,
    enum: Object.values(ACTIVITY_TRACKER_EVENTS),
    required: true
  },

  deviceUUID: {
    type: String,
    required: true,
    match: UUID_V4_REGEX
  },

  deviceName: {
    type: String,
    default: null
  },

  deviceType: {
    type: String,
    enum: Object.values(DeviceTypes),
    default: null
  },

  performedBy: {
    type: String,
    enum: Object.values(AdminTypes),
    default: AdminTypes.INTERNAL_ADMIN
  },

  description: {
    type: String,
    required: true
  },

  oldData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  newData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  adminActions: {
    type: new mongoose.Schema(
      {
        targetId: {
          type: String,
          default: null,
        },

        performedOn: {
          type: String,
          enum: Object.values(PerformedOnTypes),
          default: null,
        },

        reason: {
          type: String,
          default: null,
        },

        queryFilter: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
          select: false
        },

        filter: {
          type: [String],
          validate: {
            validator: function (arr) {
              return arr.every((item) =>
                Object.values(ACTIVITY_TRACKER_EVENTS).includes(item)
              );
            },
            message:
              "Filter must contain valid ACTIVITY_TRACKER_EVENTS",
          },
          default: undefined,
        },
      },
      { _id: false }
    ),
    default: null,
  },
  requestId: {
    type: String,
    required: true,
    match: UUID_V4_REGEX,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = {
  ActivityTrackerModel: mongoose.model(DB_COLLECTIONS.ACTIVITY_TRACKERS, activityTrackerSchema)
};