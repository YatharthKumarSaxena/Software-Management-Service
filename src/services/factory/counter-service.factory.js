// factory/counter-service.factory.js

const { CounterModel } = require("@/models");
const { ENTITY_MAPPING } = require("@/configs/entity-mapping.config");
const { logWithTime } = require("@/utils/time-stamps.util");

const createCounterService = (
    collectionName,
    {
        global = false
    } = {}
) => {

    return async (projectId = null) => {

        try {

            const entityType =
                ENTITY_MAPPING[collectionName];

            if (!entityType) {
                return {
                    success: false,
                    message:
                        `No entity mapping found for collection: ${collectionName}`
                };
            }

            const filter = global
                ? { entityType }
                : { projectId, entityType };

            const setOnInsert = global
                ? { entityType }
                : { projectId, entityType };

            logWithTime(
                `🔄 Generating sequence for collection: ${collectionName}` +
                (global
                    ? " [GLOBAL]"
                    : ` for project: ${projectId}`)
            );

            const counter =
                await CounterModel.findOneAndUpdate(
                    filter,
                    {
                        $inc: {
                            nextSequence: 1
                        },
                        $setOnInsert: setOnInsert
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
                    message:
                        `Failed to create or update counter for collection: ${collectionName}`
                };
            }

            const sequence =
                counter.nextSequence;

            const generatedId =
                `${entityType}-${sequence}`;

            logWithTime(
                `✅ Generated ID: ${generatedId}`
            );

            return {
                success: true,
                sequence,
                generatedId
            };

        } catch (error) {

            logWithTime(
                `❌ Error in Counter Service for collection ${collectionName}: ${error.message}`
            );

            return {
                success: false,
                message:
                    `Error generating counter for collection ${collectionName}`
            };
        }
    };
};

module.exports = {
    createCounterService
};