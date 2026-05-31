
const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { ScopeTypes, ScopeCategoryTypes } = require('@/configs/enums.config');
const { customIdRegex } = require('@/configs/regex.config');
const { descriptionLength, titleLength } = require('@/configs/fields-length.config');
const mongoose = require('mongoose');

const ScopeSchema = new mongoose.Schema({
  inceptionId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.INCEPTIONS, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.PROJECTS, required: true },
  type: { type: String, enum: Object.values(ScopeTypes), default: ScopeTypes.IN_SCOPE },
  category: { type: String, trim: true, default: ScopeCategoryTypes.GLOBAL, enum: Object.values(ScopeCategoryTypes) },
  featureId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.HIGH_LEVEL_FEATURES, default: null },
  title: { type: String, trim: true, minlength: titleLength.min, maxlength: titleLength.max, lowercase: false, required: true },
  description: { type: String, trim: true, default: null, minlength: descriptionLength.min, maxlength: descriptionLength.max },
  sequence: { type: Number, required: true, min: 1 },
  id: { type: String, required: true, trim: true },
  createdBy: { type: String, required: true, match: customIdRegex },
  updatedBy: { type: String, match: customIdRegex, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, match: customIdRegex, default: null }
}, {
  timestamps: true
});

ScopeSchema.index(
  { projectId: 1, title: 1, type: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
    partialFilterExpression: { isDeleted: false }
  }
);

ScopeSchema.index(
  { projectId: 1, id: 1 },
  {
    unique: true
  }
);

const ScopeModel = mongoose.model(DB_COLLECTIONS.SCOPES, ScopeSchema);

module.exports = {
  ScopeModel
}