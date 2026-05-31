const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { customIdRegex } = require('@/configs/regex.config');
const { descriptionLength, titleLength } = require('@/configs/fields-length.config');
const mongoose = require('mongoose');

const HighLevelFeatureSchema = new mongoose.Schema({
  inceptionId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.INCEPTIONS, required: true },
  ideaId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.IDEAS, default: null },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.PROJECTS, required: true },
  title: { type: String, trim: true, minlength: titleLength.min, maxlength: titleLength.max, required: true },
  description: { type: String, trim: true, default: null, minlength: descriptionLength.min, maxlength: descriptionLength.max },
  sequence: { type: Number, required: true, min: 1 },
  id: { type: String, required: true, trim: true },
  createdBy: { type: String, required: true, match: customIdRegex },
  updatedBy: { type: String, match: customIdRegex, default: null  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, match: customIdRegex, default: null }
}, {
  timestamps: true
});

HighLevelFeatureSchema.index(
  { projectId: 1, title: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

HighLevelFeatureSchema.index(
  { projectId: 1, id: 1 },
  { unique: true }
);

const HighLevelFeatureModel = mongoose.model(DB_COLLECTIONS.HIGH_LEVEL_FEATURES, HighLevelFeatureSchema);

module.exports = {
    HighLevelFeatureModel
}