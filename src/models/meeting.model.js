const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { descriptionLength, titleLength } = require("@/configs/fields-length.config");
const { ParticipantTypes, MeetingPlatformTypes, MeetingStatuses, MeetingGroups, MeetingCancellationReasons } = require("@/configs/enums.config");
const mongoose = require("mongoose");

const MeetingEntityTypes = Object.freeze({
  [DB_COLLECTIONS.ELICITATIONS]: DB_COLLECTIONS.ELICITATIONS,
  [DB_COLLECTIONS.NEGOTIATIONS]: DB_COLLECTIONS.NEGOTIATIONS,
  [DB_COLLECTIONS.SPECIFICATIONS]: DB_COLLECTIONS.SPECIFICATIONS,
  [DB_COLLECTIONS.ELABORATIONS]: DB_COLLECTIONS.ELABORATIONS,
  [DB_COLLECTIONS.VALIDATIONS]: DB_COLLECTIONS.VALIDATIONS,
  [DB_COLLECTIONS.INCEPTIONS]: DB_COLLECTIONS.INCEPTIONS
});

const participantSchema = new mongoose.Schema({

  userId: {
    type: String,
    match: customIdRegex,
    required: true
  },

  role: {
    type: String,
    enum: Object.values(ParticipantTypes),
    default: ParticipantTypes.PARTICIPANT
  },

  roleDescription: {
    type: String,
    default: null // optional (SCRIBE, OBSERVER etc. for UI only)
  },

  addedBy: {
    type: String,
    match: customIdRegex,
    immutable: true,
    required: true
  },

  updatedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  removedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  removedAt: {
    type: Date,
    default: null
  },

  removeReason: {
    type: String,
    default: null
  }

}, { _id: true, timestamps: true });


const meetingSchema = new mongoose.Schema({

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType',
    required: true,
    immutable: true,
    index: true
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    immutable: true,
    index: true
  },

  entityType: {
    type: String,
    enum: Object.values(MeetingEntityTypes),
    immutable: true,
    default: DB_COLLECTIONS.ELICITATIONS
  },

  platform: {
    type: String,
    enum: Object.values(MeetingPlatformTypes),
    default: MeetingPlatformTypes.GOOGLE_MEET
  },

  status: {
    type: String,
    enum: Object.values(MeetingStatuses),
    default: MeetingStatuses.DRAFT
  },

  scheduledAt: {
    type: Date,
    default: null
  },

  startedAt: {
    type: Date,
    default: null
  },

  endedAt: {
    type: Date,
    default: null
  },

  expectedDuration: {
    type: Number, // in minutes
    default: 60,
    min: 15,
    max: 480
  },

  meetingLink: {
    type: String,
    default: null
  },

  meetingPassword: {
    type: String,
    default: null
  },

  meetingGroup: {
    type: String,
    enum: Object.values(MeetingGroups),
    default: MeetingGroups.GENERAL
  },

  facilitatorId: {
    type: String,
    match: customIdRegex,
    required: true
  },

  participants: {
    type: [participantSchema],
    default: [],
    validate: {
      validator: function (participants) {
        const activeIds = participants
          .filter(p => !p.isDeleted)
          .map(p => p.userId);
        return activeIds.length === new Set(activeIds).size;
      },
      message: "Duplicate participants not allowed"
    }
  },

  title: {
    type: String,
    trim: true,
    minlength: titleLength.min,
    maxlength: titleLength.max,
    required: true
  },

  description: {
    type: String,
    trim: true,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max,
    default: null
  },

  createdBy: {
    type: String,
    match: customIdRegex,
    required: true
  },

  updatedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  isScheduleFrozen: {
    type: Boolean,
    default: false
  },

  cancelledAt: {
    type: Date,
    default: null
  },

  cancelledBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  cancelReason: {
    type: String,
    enum: Object.values(MeetingCancellationReasons),
    default: null
  },

  cancelDescription: {
    type: String,
    default: null
  },

}, { timestamps: true });

meetingSchema.index(
  { entityId: 1, entityType: 1 },
  { partialFilterExpression: { status: { $ne: MeetingStatuses.CANCELLED } } }
);
meetingSchema.index(
  { facilitatorId: 1 },
  { partialFilterExpression: { status: { $ne: MeetingStatuses.CANCELLED } } }
);
meetingSchema.index(
  { scheduledAt: 1 },
  { partialFilterExpression: { status: { $ne: MeetingStatuses.CANCELLED }, scheduledAt: { $ne: null } } }
);
meetingSchema.index(
  { entityId: 1, entityType: 1, status: 1 }
);
meetingSchema.index(
  { 'participants.userId': 1, status: 1 }
);

const MeetingModel = mongoose.model(DB_COLLECTIONS.MEETINGS, meetingSchema);

module.exports = {
  MeetingModel
}