const { logWithTime } = require("@utils/time-stamps.util");
const { isValidUUID } = require("@utils/id-validators.util");
const { logServiceTrackerEvent } = require("@services/audit/service-tracker.service");
const { SYSTEM_LOG_EVENTS, STATUS_TYPES, SERVICE_NAMES } = require("@configs/system-log-events.config");
const { DeviceModel } = require("@/models");

/**
 * Toggle Block Status Service
 * Updates the isBlocked flag for a user or admin
 * 
 * @param {string} deviceUUID - The custom device ID (UUID format)
 * @param {boolean} isBlocked - The new isBlocked status
 * @param {string} executedBy - The adminId of who executed the toggle
 * @param {string} requestId - The request ID for tracking
 * @returns {Promise<Object>} - { success: boolean, message: string, data?: Object }
 */
const toggleBlockDeviceStatusService = async (deviceUUID, isBlocked, executedBy, requestId) => {
    try {
        // Step 1: Validate deviceUUID format
        if (!deviceUUID || !isValidUUID(deviceUUID)) {
            logWithTime(`❌ Invalid deviceUUID format: ${deviceUUID}`);

            logServiceTrackerEvent({
                serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
                eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
                action: "TOGGLE_BLOCK_DEVICE_STATUS_VALIDATION_FAILED",
                status: STATUS_TYPES.FAILURE,
                description: `Block status toggle failed: Invalid deviceUUID format (${deviceUUID})`,
                targetId: deviceUUID,
                executedBy: executedBy,
                metadata: { reason: "Invalid deviceUUID format" }
            });

            return {
                success: false,
                type: "BadRequest",
                message: "Invalid deviceUUID format. Please provide a valid UUID."
            };
        }

        // Step 6: Perform the isBlocked status update
        logWithTime(`🔄 Toggling block status for: ${deviceUUID} to ${isBlocked}`);

        const updatedDevice = await DeviceModel.findOneAndUpdate(
            { deviceUUID },
            {
                $set: { isBlocked },
                $setOnInsert: {
                    deviceUUID,
                    createdAt: new Date()
                }
            },
            {
                upsert: true,
                returnDocument: "after",
                lean: true
            }
        );

        // Step 7: Log success to ServiceTracker
        logWithTime(`✅ Successfully toggled block status for: ${deviceUUID}`);

        logServiceTrackerEvent({
            serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
            eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
            action: "TOGGLE_BLOCK_DEVICE_STATUS_SUCCESS",
            status: STATUS_TYPES.SUCCESS,
            description: `Device block status toggled to ${isBlocked} with ${deviceUUID}`,
            targetId: deviceUUID,
            executedBy: executedBy,
            metadata: {
                isBlocked: updatedDevice.isBlocked
            }
        });

        return {
            success: true,
            data: updatedDevice,
            message: `Device block status toggled to ${isBlocked} successfully.`
        };

    } catch (err) {
        logWithTime(`💥 Error in toggleBlockDeviceStatusService: ${err.message}`);

        // Log the error to ServiceTracker
        logServiceTrackerEvent({
            serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
            eventType: SYSTEM_LOG_EVENTS.SYSTEM_ERROR,
            action: "TOGGLE_BLOCK_DEVICE_STATUS_ERROR",
            status: STATUS_TYPES.ERROR,
            description: `Unexpected error during block status toggle: ${err.message}`,
            targetId: deviceUUID || "unknown",
            executedBy: executedBy,
            metadata: {
                error: err.message,
                stack: err.stack
            }
        });

        return {
            success: false,
            type: "InternalServerError",
            message: err.message || "An error occurred while toggling the block status."
        };
    }
};

module.exports = {
    toggleBlockDeviceStatusService
};
