const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { PhaseDeletionReason, ParticipantTypes, ElicitationModes, MeetingPlatformTypes } = require("@/configs/enums.config");
const { descriptionLength, titleLength } = require("@/configs/fields-length.config");
const mongoose = require("mongoose");

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

  addedAt: {
    type: Date,
    default: Date.now
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
  }

}, { _id: true });

const elicitationSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  isFrozen: {
    type: Boolean,
    default: false
  },

  startedAt: {
    type: Date,
    default: null
  },

  title: {
    type: String,
    trim: true,
    minlength: titleLength.min,
    maxlength: titleLength.max,
    default: null
  },

  description: {
    type: String,
    trim: true,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max,
    default: null
  },

  version: {
    major: {
      type: Number, // equivalent to cycleNumber
      default: 1
    },
    minor: {
      type: Number, // updates inside cycle
      default: 0
    }
  },

  meetingLink: {
    type: String,
    default: null
  },

  meetingPassword: {
    type: String,
    default: null
  },

  participants: {
    type: [participantSchema],
    default: [],
    validate: {
      validator: function (participants) {
        const ids = participants.map(p => p.userId);
        return ids.length === new Set(ids).size;
      },
      message: 'Duplicate participants not allowed'
    }
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

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  },

  deletedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  elicitationMode: {
    type: String,
    enum: Object.values(ElicitationModes),
    default: ElicitationModes.OPEN
  },

  deletionReasonType: {
    type: String,
    enum: Object.values(PhaseDeletionReason),
    default: null
  },

  deletionReasonDescription: {
    type: String,
    default: null,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max
  }

}, { timestamps: true });

elicitationSchema.index({ projectId: 1, isDeleted: 1 });
elicitationSchema.index({ projectId: 1, "version.major": -1, isDeleted: 1 });

const ElicitationModel = mongoose.model(DB_COLLECTIONS.ELICITATIONS, elicitationSchema);

module.exports = {
  ElicitationModel
};