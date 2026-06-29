const mongoose = require("mongoose");
const { BulkImportModel } = require("@models/bulk-import.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { BulkImportStatuses, BulkImportCategories, BulkImportFileTypes } = require("@/configs/enums.config");
const { logWithTime } = require("@/utils/time-stamps.util");
const { INTERNAL_ERROR } = require("@/configs/http-status.config");
const { getMyEnvAsBool } = require("@/utils/env.util");
const { uploadBulkImportFilesService } = require("@services/storage/supabase-storage.service");
const { deleteFileIfExists } = require("@utils/bulk-import-temp.util");

const createBulkImportService = async ({
    project,
    createdBy,
    preserveSourceFile = null,
    preserveProcessedFile = null,
    failedRows,
    totalRows,
    successfulRows,
    category,
    createdIds,
    originalFilePath = null,
    processedFilePath = null,
    auditContext
}) => {

    try {

        if (!project?._id) {
            return {
                success: false,
                message: "Project is required.",
                errorCode: INTERNAL_ERROR
            };
        }

        if (!createdBy) {
            return {
                success: false,
                message: "createdBy is required.",
                errorCode: INTERNAL_ERROR
            };
        }

        if (!category) {
            return {
                success: false,
                message: "Bulk import category is required.",
                errorCode: INTERNAL_ERROR
            };
        }

        if (!Object.values(BulkImportCategories).includes(category)) {
            return {
                success: false,
                message: "Invalid bulk import category.",
                errorCode: INTERNAL_ERROR
            };
        }

        // Statistics
        if (!Number.isInteger(totalRows) || totalRows < 0) {
            return {
                success: false,
                message: "Invalid totalRows.",
                errorCode: INTERNAL_ERROR
            };
        }

        if (!Number.isInteger(successfulRows) || successfulRows < 0) {
            return {
                success: false,
                message: "Invalid successfulRows.",
                errorCode: INTERNAL_ERROR
            };
        }

        if (!Number.isInteger(failedRows) || failedRows < 0) {
            return {
                success: false,
                message: "Invalid failedRows.",
                errorCode: INTERNAL_ERROR
            };
        }

        // Successful rows cannot exceed total
        if (successfulRows + failedRows > totalRows) {
            return {
                success: false,
                message: "successfulRows + failedRows must not exceed totalRows.",
                errorCode: INTERNAL_ERROR
            };
        }

        // createdIds
        if (!Array.isArray(createdIds)) {
            return {
                success: false,
                message: "createdIds must be an array.",
                errorCode: INTERNAL_ERROR
            };
        }

        // Must match successful rows
        if (createdIds.length !== successfulRows) {
            return {
                success: false,
                message: "createdIds count must match successfulRows.",
                errorCode: INTERNAL_ERROR
            };
        }

        // Validate every ObjectId
        for (const id of createdIds) {
            if (!mongoose.isValidObjectId(id)) {
                return {
                    success: false,
                    message: "Invalid ObjectId in createdIds.",
                    errorCode: INTERNAL_ERROR
                };
            }
        }

        // Duplicate ObjectIds
        const uniqueIds = new Set(createdIds.map(id => id.toString()));

        if (uniqueIds.size !== createdIds.length) {
            return {
                success: false,
                message: "Duplicate createdIds are not allowed.",
                errorCode: INTERNAL_ERROR
            };
        }

        let status = BulkImportStatuses.FAILED;

        if (failedRows === 0 && successfulRows > 0) {

            status = BulkImportStatuses.COMPLETED;

        } else if (successfulRows > 0) {

            status = BulkImportStatuses.PARTIALLY_COMPLETED;

        }

        const bulkImport = new BulkImportModel({
            projectId: project._id,
            createdBy,
            category,
            preserveSourceFile,
            status,
            totalRows,
            successfulRows,
            failedRows,
            createdIds
        });

        const savedBulkImport = await bulkImport.save();

        logWithTime(
            `✅ [createBulkImportService] Bulk Import created: ${savedBulkImport._id}`
        );

        // ── Decide which files to upload (business logic lives here) ─────────
        const projectId = project._id.toString();
        const bulkImportId = savedBulkImport._id.toString();

        const filesToUpload = [];
        const shouldUploadOriginal =
            preserveSourceFile === null
                ? getMyEnvAsBool("BULK_IMPORT_UPLOAD_ORIGINAL", false)
                : preserveSourceFile;

        const shouldUploadProcessed =
            preserveProcessedFile === null
                ? getMyEnvAsBool("BULK_IMPORT_UPLOAD_PROCESSED", true)
                : preserveProcessedFile;

        if (originalFilePath && shouldUploadOriginal) {
            filesToUpload.push({
                type: BulkImportFileTypes.ORIGINAL,
                path: originalFilePath,
            });
        }

        if (processedFilePath && shouldUploadProcessed) {
            filesToUpload.push({
                type: BulkImportFileTypes.PROCESSED,
                path: processedFilePath,
            });
        }

        // ── Upload pre-decided files to Supabase Storage ──────────────────────
        const { originalFileUrl, processedFileUrl } =
            await uploadBulkImportFilesService({
                projectId,
                bulkImportId,
                files: filesToUpload,
            });

        // Persist blob URLs if at least one upload succeeded
        if (originalFileUrl || processedFileUrl) {
            savedBulkImport.originalFileUrl = originalFileUrl;
            savedBulkImport.processedFileUrl = processedFileUrl;
            await savedBulkImport.save();

            logWithTime(
                `📎 [createBulkImportService] File URLs stored for import ${bulkImportId}`
            );
        }

        // ── Delete temporary local files ──────────────────────────────────────
        deleteFileIfExists(originalFilePath);
        deleteFileIfExists(processedFilePath);

        // Fire & Forget
        const {
            user,
            device,
            requestId
        } = auditContext || {};

        logActivityTrackerEvent(

            user,

            device,

            requestId,

            ACTIVITY_TRACKER_EVENTS.BULK_IMPORT_CREATED,

            `Bulk import created.`,

            {
                oldData: null,
                newData: savedBulkImport.toObject(),

                adminActions: {
                    targetId: savedBulkImport._id.toString()
                }
            }

        );

        return {

            success: true,

            bulkImport: savedBulkImport

        };

    } catch (error) {

        logWithTime(
            `❌ [createBulkImportService] ${error.message}`
        );

        return {

            success: false,

            message: "Failed to create bulk import.",

            errorCode: INTERNAL_ERROR,

            error: error.message

        };

    }

};

module.exports = {
    createBulkImportService
}