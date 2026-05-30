const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { ENTITY_MAPPING } = require("@/configs/entity-mapping.config");

const mongoose = require("mongoose");


const CounterSchema = new mongoose.Schema(
    {
        entityType: { 
            type: String,
            required: true,
            unique: true,
            trim: true,
            enum: Object.values(ENTITY_MAPPING)
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

const CounterModel = mongoose.model(DB_COLLECTIONS.COUNTERS, CounterSchema);

module.exports = { CounterModel };