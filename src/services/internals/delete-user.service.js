const { logWithTime } = require("@utils/time-stamps.util");
const { isValidCustomId } = require("@utils/id-validators.util");
const { getModelByType } = require("@services/common/get-model-by-type.service");
const { logServiceTrackerEvent } = require("@services/audit/service-tracker.service");
const { SYSTEM_LOG_EVENTS, STATUS_TYPES, SERVICE_NAMES } = require("@configs/system-log-events.config");
const { TotalTypes } = require("@configs/enums.config");

/**
 * Delete User Service
 * Soft-deletes a user or admin by setting isDeleted: true
 * 
 * @param {string} userId - The custom user/admin ID (USR format)
 * @param {string} type - The entity type (TotalTypes.ADMIN, TotalTypes.USER, or TotalTypes.CLIENT)
 * @param {string} executedBy - The adminId of who executed the delete
 * @param {string} requestId - The request ID for tracking
 * @returns {Promise<Object>} - { success: boolean, message: string, data?: Object, type?: string }
 */
const deleteUserService = async (userId, type, executedBy, requestId) => {
  try {
    // Step 1: Validate userId format
    if (!userId || !isValidCustomId(userId)) {
      logWithTime(`❌ Invalid userId format: ${userId}`);
      
      logServiceTrackerEvent({
        serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
        action: "DELETE_USER_VALIDATION_FAILED",
        status: STATUS_TYPES.FAILURE,
        description: `User deletion failed: Invalid userId format (${userId})`,
        targetId: userId,
        executedBy: executedBy,
        metadata: { reason: "Invalid userId format", type }
      });

      return {
        success: false,
        type: "BadRequest",
        message: "Invalid userId format. Please provide a valid custom ID."
      };
    }

    // Step 2: Get the appropriate model based on type
    const Model = getModelByType(type);

    // Step 3: Determine the ID field name based on type
    const idField = type === TotalTypes.ADMIN ? "adminId" : "clientId";

    // Step 4: Query for the user/admin
    const query = { [idField]: userId, isDeleted: false };
    
    logWithTime(`🔍 Searching for ${type} with ${idField}: ${userId}`);
    
    const userToDelete = await Model.findOne(query).lean();

    // Step 5: Handle not found scenario
    if (!userToDelete) {
      logWithTime(`⚠️ ${type} not found or already deleted: ${userId}`);
      
      logServiceTrackerEvent({
        serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
        action: "DELETE_USER_NOT_FOUND",
        status: STATUS_TYPES.FAILURE,
        description: `User deletion failed: ${type} not found with ${idField} ${userId}`,
        targetId: userId,
        executedBy: executedBy,
        metadata: { reason: "User not found", type }
      });

      return {
        success: false,
        type: "Conflict",
        message: `${type} not found or already deleted.`
      };
    }

    // Step 6: Perform the soft delete
    logWithTime(`🗑️ Soft deleting ${type}: ${userId}`);
    
    const updateQuery = { [idField]: userId };
    const updateData = { isDeleted: true };
    
    const deletedUser = await Model.findOneAndUpdate(
      updateQuery,
      updateData,
      { new: true, lean: true }
    );

    // Step 7: Log success to ServiceTracker
    logWithTime(`✅ Successfully deleted ${type}: ${userId}`);
    
    logServiceTrackerEvent({
      serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
      eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
      action: "DELETE_USER_SUCCESS",
      status: STATUS_TYPES.SUCCESS,
      description: `${type} successfully deleted with ${idField} ${userId}`,
      targetId: userId,
      executedBy: executedBy,
      metadata: { 
        type,
        idField,
        isDeleted: deletedUser.isDeleted
      }
    });

    return {
      success: true,
      data: deletedUser,
      message: `${type} deleted successfully.`
    };

  } catch (err) {
    logWithTime(`💥 Error in deleteUserService: ${err.message}`);
    
    // Log the error to ServiceTracker
    logServiceTrackerEvent({
      serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
      eventType: SYSTEM_LOG_EVENTS.SYSTEM_ERROR,
      action: "DELETE_USER_ERROR",
      status: STATUS_TYPES.ERROR,
      description: `Unexpected error during user deletion: ${err.message}`,
      targetId: userId || "unknown",
      executedBy: executedBy,
      metadata: { 
        error: err.message,
        type,
        stack: err.stack
      }
    });

    return {
      success: false,
      type: "InternalServerError",
      message: err.message || "An error occurred while deleting the user."
    };
  }
};

module.exports = {
  deleteUserService
};
