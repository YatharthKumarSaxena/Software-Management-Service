const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { 
  ProjectCategoryTypes, 
  ProjectTypes, 
  PriorityLevels, 
  RequestStatus 
} = require("@configs/enums.config");

const {
  projectNameLength,
  descriptionLength
} = require("@configs/fields-length.config");
const { customIdRegex } = require("@/configs/regex.config");

const productRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: projectNameLength.min,
      maxlength: projectNameLength.max
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: descriptionLength.min,
      maxlength: descriptionLength.max
    },

    projectType: {
      type: String,
      enum: ProjectTypes,
      default: ProjectTypes.DEVELOPMENT
    },

    projectCategory: {
      type: String,
      enum: ProjectCategoryTypes,
      default: ProjectCategoryTypes.INDIVIDUAL
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DB_COLLECTIONS.CLIENTS,
      required: true,
      immutable: true,
      index: true
    },

    priority: {
      type: String,
      enum: PriorityLevels,
      default: PriorityLevels.MEDIUM
    },

    expectedTimelineInDays: {
      type: Number,
      required: false,
      default: null,
      min: 1
    },

    budget: {
      type: Number,
      min: 0
    },

    status: {
      type: String,
      enum: RequestStatus,
      default: RequestStatus.PENDING,
      index: true
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
      default: null,
      match: customIdRegex
    }
  },
  {
    timestamps: true
  }
);

productRequestSchema.index({ requestedBy: 1, status: 1, isDeleted: 1 });

const ProductRequestModel = mongoose.model(DB_COLLECTIONS.PRODUCT_REQUESTS, productRequestSchema);

module.exports = { ProductRequestModel };