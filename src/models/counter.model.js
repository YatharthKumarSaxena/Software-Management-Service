const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { ENTITY_MAPPING } = require("@/configs/entity-mapping.config");

const mongoose = require("mongoose");


const CounterSchema = new mongoose.Schema(
    {
        entityType: { 
            type: String,
            required: true,
            trim: true,
            enum: Object.values(ENTITY_MAPPING)
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: DB_COLLECTIONS.PROJECTS
        },

        nextSequence: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

CounterSchema.index(
    { projectId: 1, entityType: 1 },
    { unique: true }
);

const CounterModel = mongoose.model(DB_COLLECTIONS.COUNTERS, CounterSchema);

module.exports = { CounterModel };