// factory/counter-service.factory.js

const { CounterModel } = require("@/models");
const { ENTITY_MAPPING } = require("@/configs/entity-mapping.config");
const { logWithTime } = require("@/utils/time-stamps.util");

const createCounterService = (collectionName) => {
    return async (projectId) => {
        try {
            const entityType = ENTITY_MAPPING[collectionName];

            if (!entityType) {
                return {
                    success: false,
                    message: `No entity mapping found for collection: ${collectionName}`
                }
            }

            logWithTime(`🔄 Generating sequence for collection: ${collectionName} for project: ${projectId}`);

            const counter = await CounterModel.findOneAndUpdate(
                { projectId, entityType },
                {
                    $inc: { nextSequence: 1 },
                    $setOnInsert: {
                        projectId,
                        entityType
                    }
                },
                {
                    returnDocument: "after",
                    upsert: true,
                    setDefaultsOnInsert: true
                }
            );

            if (!counter) {
                return {
                    success: false,
                    message: `Failed to create or update counter for collection: ${collectionName} and project: ${projectId}`
                }
            }

            const sequence = counter.nextSequence;
            const generatedId = `${entityType}-${sequence}`;

            logWithTime(`✅ Generated ID: ${generatedId} for collection: ${collectionName} for project: ${projectId}`);

            return {
                success: true,
                sequence,
                generatedId
            };
        } catch (error) {
            logWithTime(`❌ Error in Counter Service for collection ${collectionName} and project ${projectId}: ${error.message}`);
            return {
                success: false,
                message: `Error generating counter for collection ${collectionName} and project ${projectId}`
            }
        }
    };
};

module.exports = {
    createCounterService,
};