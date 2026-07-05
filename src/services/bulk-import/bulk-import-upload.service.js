const { BulkImportModel } = require("@models/bulk-import.model");
const {
    uploadBulkImportFilesService
} = require("@services/storage/supabase-storage.service");

const {
    deleteFileIfExists
} = require("@utils/bulk-import-temp.util");

const {
    logActivityTrackerEvent
} = require("@services/audit/activity-tracker.service");

const {
    ACTIVITY_TRACKER_EVENTS
} = require("@configs/tracker.config");

const {
    BulkImportFileTypes
} = require("@configs/enums.config");

const {
    getMyEnvAsBool
} = require("@utils/env.util");

const {
    logWithTime
} = require("@utils/time-stamps.util");

const {
    DB_COLLECTIONS
} = require("@configs/db-collections.config");

const uploadBulkImportInBackgroundService = async ({
    bulkImport,
    project,
    originalFilePath = null,
    processedFilePath = null,
    preserveSourceFile = null,
    preserveProcessedFile = null,
    auditContext
}) => {

    try {

        const projectId = project._id.toString();
        const bulkImportId = bulkImport._id.toString();

        const files = [];

        const shouldUploadOriginal =
            preserveSourceFile === null
                ? getMyEnvAsBool("BULK_IMPORT_UPLOAD_ORIGINAL", false)
                : preserveSourceFile;

        const shouldUploadProcessed =
            preserveProcessedFile === null
                ? getMyEnvAsBool("BULK_IMPORT_UPLOAD_PROCESSED", true)
                : preserveProcessedFile;

        if (originalFilePath && shouldUploadOriginal) {

            files.push({
                type: BulkImportFileTypes.ORIGINAL,
                path: originalFilePath
            });

        }

        if (processedFilePath && shouldUploadProcessed) {

            files.push({
                type: BulkImportFileTypes.PROCESSED,
                path: processedFilePath
            });

        }

        const {
            originalFileUrl,
            processedFileUrl
        } = await uploadBulkImportFilesService({
            projectId,
            bulkImportId,
            files
        });

        const update = {};

        if (originalFileUrl) {
            update.originalFileUrl = originalFileUrl;
        }

        if (processedFileUrl) {
            update.processedFileUrl = processedFileUrl;
        }

        if (Object.keys(update).length) {
            await BulkImportModel.findByIdAndUpdate(
                bulkImportId,
                update
            );
        }

        deleteFileIfExists(originalFilePath);
        deleteFileIfExists(processedFilePath);

        const {
            user,
            device,
            requestId
        } = auditContext || {};

        logActivityTrackerEvent({

            user,
            device,
            requestId,

            eventType: ACTIVITY_TRACKER_EVENTS.BULK_IMPORT_FILES_UPLOADED,

            description: "Bulk import files uploaded successfully.",

            logOptions: {

                oldData: {
                    originalFileUrl: null,
                    processedFileUrl: null
                },

                newData: {
                    originalFileUrl,
                    processedFileUrl
                },

                userActions: {
                    targetId: bulkImportId,
                    performedOn: DB_COLLECTIONS.BULK_IMPORTS
                }

            }

        });

        logWithTime(
            `✅ Bulk import files uploaded for ${bulkImportId}`
        );

    } catch (error) {

        logWithTime(
            `❌ Background upload failed: ${error.message}`
        );

    }

};

module.exports = {
    uploadBulkImportInBackgroundService
};