
const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { RequirementTypes, RequirementSources, RequirementStatuses, PriorityLevels, WorkflowModes, RelationTypes } = require('@/configs/enums.config');
const { descriptionLength, titleLength, acceptanceCriteriaLength, tagLength } = require('@/configs/fields-length.config');
const { customIdRegex, tagRegex, acceptanceCriteriaRegex } = require('@/configs/regex.config');
const { IssuedReasonTypes, RejectedReasonTypes, DeferredReasonTypes, RevokeReasonTypes } = require("@configs/reasons.config");
const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
    entityType: { type: String, enum: [DB_COLLECTIONS.ELABORATIONS, DB_COLLECTIONS.ELICITATIONS], immutable: true, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityType', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.PROJECTS, required: true },
    title: { type: String, trim: true, minlength: titleLength.min, maxlength: titleLength.max, required: true },
    description: { type: String, trim: true, default: null, minlength: descriptionLength.min, maxlength: descriptionLength.max },
    type: { type: String, enum: Object.values(RequirementTypes), default: RequirementTypes.FUNCTIONAL },
    parentFeatureId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.HIGH_LEVEL_FEATURES, default: null },
    aiSuggestedType: { type: String, enum: Object.values(RequirementTypes), default: null },
    status: { type: String, enum: Object.values(RequirementStatuses), default: RequirementStatuses.DRAFT },
    source: { type: String, enum: Object.values(RequirementSources), default: RequirementSources.MANUAL },
    createdBy: { type: String, required: true, match: customIdRegex },
    updatedBy: { type: String, match: customIdRegex, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, match: customIdRegex, default: null },
    isAdminModified: { type: Boolean, default: false },
    reviewNotes: {
        type: [{
            description: {
                type: String,
                minlength: descriptionLength.min,
                maxlength: descriptionLength.max,
                required: true
            },
            createdBy: {
                type: String,
                match: customIdRegex,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: null
            },
            deletedAt: {
                type: Date,
                default: null
            },
            isDeleted: {
                type: Boolean,
                default: false
            },
            deletedBy: {
                type: String,
                match: customIdRegex,
                default: null
            }
        }
        ],
        default: []
    },
    priority: {
        type: String,
        enum: Object.values(PriorityLevels),
        default: PriorityLevels.MEDIUM
    },
    createdInMode: {
        type: String,
        enum: Object.values(WorkflowModes),
        default: WorkflowModes.OPEN
    },
    linkedRequirements: {
        type: [{
            requirementId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: DB_COLLECTIONS.REQUIREMENTS,
                required: true
            },
            relationType: {
                type: String,
                enum: Object.values(RelationTypes),
                required: true // e.g. DEPENDS_ON, DUPLICATE_OF, BLOCKS
            },
            relationshipNotes: {
                type: String,
                trim: true,
                default: null,
                minlength: descriptionLength.min,
                maxlength: descriptionLength.max
            },
            createdBy: {
                type: String,
                match: customIdRegex,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: null
            },
            updatedBy: {
                type: String,
                match: customIdRegex,
                default: null
            },
        }],
        default: []
    },
    decision: {

        reasonType: {
            type: String,
            enum: [
                ...new Set([
                    ...Object.values(RejectedReasonTypes),
                    ...Object.values(DeferredReasonTypes),
                    ...Object.values(IssuedReasonTypes),
                    ...Object.values(RevokeReasonTypes)
                ])
            ],
            default: null
        },

        reasonDescription: {
            type: String,
            trim: true,
            default: null,
            minlength: descriptionLength.min,
            maxlength: descriptionLength.max
        },

        decidedBy: {
            type: String,
            match: customIdRegex,
            default: null
        },

        decidedAt: {
            type: Date,
            default: null
        }
    },
    timeline: {
        proposedDate: {
            type: Date,
            default: null
        },
        expectedDeliveryDate: {
            type: Date,
            default: null
        }
    },
    acceptanceCriteria: {
        type: [String], // Array of strings (e.g., ["User should receive OTP within 5 secs", "Error message should be red"])
        default: [],
        validate: {
            validator: function (criteria) {
                return criteria.every(c =>
                    c &&
                    c.trim().length >= acceptanceCriteriaLength.min &&
                    c.trim().length <= acceptanceCriteriaLength.max &&
                    acceptanceCriteriaRegex.test(c.trim())
                );
            },
            message: 'Each acceptance criterion must be 20-2000 characters'
        }
    },
    tags: {
        type: [String],
        default: [],
        set: function (tags) {
            return [...new Set(tags.map(tag => tag.trim().toLowerCase()))];
        },
        validate: {
            validator: function (tags) {
                if (tags.length > 10) return false;
                return tags.every(tag =>
                    tag &&
                    tag.length >= tagLength.min &&
                    tag.length <= tagLength.max &&
                    tagRegex.test(tag)
                );
            },
            message: 'Each tag must be 2-30 characters, lowercase alphanumeric with - and _'
        }
    },
    attachments: {
        type: [{
            fileName: String,
            fileUrl: String,
            uploadedAt: { type: Date, default: Date.now }
        }],
        default: []
    },
    assigneeId: {
        type: String,
        match: customIdRegex,
        default: null
    },
    collaborators: {
        type: [{
            type: String,
            match: customIdRegex
        }],
        default: []
    },
    governance: {

        isProtected: {
            type: Boolean,
            default: false
        },

        approverId: {
            type: String,
            match: customIdRegex,
            default: null
        },

        reviewerIds: {
            type: [{
                type: String,
                match: customIdRegex
            }],
            default: [],
            validate: {
                validator: function (v) {
                    return new Set(v).size === v.length;
                },
                message: "Duplicate reviewers are not allowed"
            }
        },

        assignedAt: {
            type: Date,
            default: null
        },

        assignedBy: {
            type: String,
            match: customIdRegex,
            default: null
        }

    },
    sequence: { type: Number, required: true, min: 1 },
    id: { type: String, required: true, trim: true },
}, {
    timestamps: true,
    optimisticConcurrency: true
});

RequirementSchema.index(
    { projectId: 1, title: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false }
    }
);
RequirementSchema.index({ entityId: 1, isDeleted: 1 });
RequirementSchema.index({ entityId: 1, parentFeatureId: 1, isDeleted: 1 });
RequirementSchema.index({ entityId: 1, status: 1, isDeleted: 1 });
RequirementSchema.index({ entityId: 1, createdAt: -1, isDeleted: 1 });
RequirementSchema.index({ tags: 1 });
RequirementSchema.index(
    { projectId: 1, id: 1 },
    { unique: true }
);



// ── Auto-add tag when created under elaboration ──────────────────────────────────────────────────────
RequirementSchema.pre('save', function () {
    if (this.entityType === DB_COLLECTIONS.ELABORATIONS) {
        if (!this.tags.includes('created_under_elaboration')) {
            this.tags.push('created_under_elaboration');
        }
    }
    if (
        this.governance?.approverId &&
        this.governance?.reviewerIds?.includes(
            this.governance.approverId
        )
    ) {
        throw new Error(
            "Approver cannot be a reviewer"
        );
    }
});

const RequirementModel = mongoose.model(DB_COLLECTIONS.REQUIREMENTS, RequirementSchema);

module.exports = {
    RequirementModel
}