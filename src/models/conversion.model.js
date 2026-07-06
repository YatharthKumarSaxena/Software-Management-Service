const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { UUID_V4_REGEX, customIdRegex } = require("@configs/regex.config");
const { ConversionTypes } = require("@/configs/enums.config");

const conversionSchema = new mongoose.Schema({
  sequence: {
    type: Number,
    required: true,
    min: 1
  },

  id: {
    type: String,
    required: true,
    trim: true
  },
  workflowId: {
    type: String,
    required: true,
    match: UUID_V4_REGEX,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    match: customIdRegex
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: DB_COLLECTIONS.PROJECTS
  },
  sourceCollection: {
    type: String,
    enum: Object.values(DB_COLLECTIONS),
    required: true
  },
  targetCollection: {
    type: String,
    enum: Object.values(DB_COLLECTIONS),
    required: true
  },
  sourceEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "sourceCollection"
  },

  targetEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "targetCollection"
  },
  conversionType: {
    type: String,
    enum: Object.values(ConversionTypes),
    required: true
  },
  deviceUUID: {
    type: String,
    required: true,
    match: UUID_V4_REGEX
  },
  createActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.ACTIVITY_TRACKERS,
    required: true
  },
  deleteActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.ACTIVITY_TRACKERS,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

conversionSchema.index(
  { projectId: 1, sequence: 1 },
  { unique: true }
);

conversionSchema.index(
  { projectId: 1, id: 1 },
  { unique: true }
);

module.exports = {
  ConversionModel: mongoose.model(DB_COLLECTIONS.CONVERSIONS, conversionSchema)
};
