// models/bulk-import.model.js

const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { BulkImportStatuses, BulkImportCategories } = require("@/configs/enums.config");
const { customIdRegex } = require("@/configs/regex.config");

const BulkImportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DB_COLLECTIONS.PROJECTS,
      required: true,
    },

    // Author
    createdBy: {
      type: String,
      required: true,
      match: customIdRegex,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(BulkImportStatuses),
      default: BulkImportStatuses.FAILED,
    },

    // Row statistics
    totalRows: {
      type: Number,
      default: 0,
      min: 0
    },
    successfulRows: {
      type: Number,
      default: 0,
      min: 0
    },
    failedRows: {
      type: Number,
      default: 0,
      min: 0
    },

    // File URLs (populated during finalize)
    processedFileUrl: {
      type: String,
      default: null,
    },
    originalFileUrl: {
      type: String,
      default: null,
    },

    // Options
    preserveSourceFile: {
      type: Boolean,
      default: false,
    },
    preserveProcessedFile: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: Object.values(BulkImportCategories),
      required: true
    },
    createdIds: {
      type: [{
        type: mongoose.Schema.Types.ObjectId
      }],
      default: [],
      validate: [
        {
          validator(ids) {
            const uniqueIds = new Set(
              ids.map(id => id.toString())
            );
            return uniqueIds.size === ids.length;
          },
          message: "Duplicate created IDs are not allowed."
        },
        {
          validator(ids) {
            return ids.length === this.successfulRows;
          },
          message: "createdIds count must match successfulRows."
        }
      ]
    }
  },
  {
    timestamps: true,
  }
);

BulkImportSchema.index({ projectId: 1, createdAt: -1 });

const BulkImportModel = mongoose.model(
  DB_COLLECTIONS.BULK_IMPORTS,
  BulkImportSchema
);

module.exports = { BulkImportModel };
