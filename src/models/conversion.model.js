const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { UUID_V4_REGEX, customIdRegex } = require("@configs/regex.config");
const { ConversionTypes } = require("@/configs/enums.config");

const conversionSchema = new mongoose.Schema({
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
    type: String,
    required: true,
    match: customIdRegex
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

module.exports = {
  ConversionModel: mongoose.model(DB_COLLECTIONS.CONVERSIONS, conversionSchema)
};
