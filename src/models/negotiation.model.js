const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { NegotiationDeletionReason } = require("@/configs/enums.config");

const negotiationSchema = new mongoose.Schema({

  projectId: {
    type: String,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  cycleNumber: {
    type: Number,
    required: true,
    default: 0
  },

  version: {
    type: String,
    default: "v1.0"
  },

  createdBy: {
    type: String,
    match: customIdRegex,
  },

  updatedBy: {
    type: String,
    match: customIdRegex
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

  deletionReasonType: {
    type: String,
    enum: Object.values(NegotiationDeletionReason),
    default: null
  },

  deletionReasonDescription: {
    type: String,
    default: null,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max
  }

}, { timestamps: true });

const NegotiationModel = mongoose.model(DB_COLLECTIONS.NEGOTIATIONS, negotiationSchema);

module.exports = {
  NegotiationModel
};