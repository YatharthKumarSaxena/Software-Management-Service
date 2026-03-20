const { logWithTime } = require("@utils/time-stamps.util");
const { isValidCustomId } = require("@utils/id-validators.util");
const { getModelByType } = require("@services/common/get-model-by-type.service");
const { logServiceTrackerEvent } = require("@services/audit/service-tracker.service");
const { SYSTEM_LOG_EVENTS, STATUS_TYPES, SERVICE_NAMES } = require("@configs/system-log-events.config");
const { TotalTypes } = require("@configs/enums.config");

/**
 * Update User Details Service
 * Updates the firstName for a user or admin
 * 
 * @param {string} userId - The custom user/admin ID (USR format)
 * @param {string} type - The entity type (TotalTypes.ADMIN, TotalTypes.USER, or TotalTypes.CLIENT)
 * @param {string} firstName - The new firstName to update
 * @param {string} executedBy - The adminId of who executed the update
 * @param {string} requestId - The request ID for tracking
 * @returns {Promise<Object>} - { success: boolean, message: string, data?: Object, type?: string }
 */
const updateUserDetailsService = async (userId, type, firstName, executedBy, requestId) => {
  try {
    // Step 1: Validate userId format
    if (!userId || !isValidCustomId(userId)) {
      logWithTime(`❌ Invalid userId format: ${userId}`);
      
      logServiceTrackerEvent({
        serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
        action: "UPDATE_USER_DETAILS_VALIDATION_FAILED",
        status: STATUS_TYPES.FAILURE,
        description: `User details update failed: Invalid userId format (${userId})`,
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

    // Step 2: Validate firstName
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      logWithTime(`❌ Invalid firstName: ${firstName}`);
      
      logServiceTrackerEvent({
        serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
        action: "UPDATE_USER_DETAILS_VALIDATION_FAILED",
        status: STATUS_TYPES.FAILURE,
        description: `User details update failed: Invalid firstName`,
        targetId: userId,
        executedBy: executedBy,
        metadata: { reason: "Invalid firstName", type }
      });

      return {
        success: false,
        type: "BadRequest",
        message: "Invalid firstName. Please provide a valid non-empty string."
      };
    }

    // Step 3: Get the appropriate model based on type
    const Model = getModelByType(type);

    // Step 4: Determine the ID field name based on type
    const idField = type === TotalTypes.ADMIN ? "adminId" : "clientId";

    // Step 5: Query for the user/admin
    const query = { [idField]: userId, isDeleted: false };
    
    logWithTime(`🔍 Searching for ${type} with ${idField}: ${userId}`);
    
    const userToUpdate = await Model.findOne(query).lean();

    // Step 6: Handle not found scenario
    if (!userToUpdate) {
      logWithTime(`⚠️ ${type} not found or deleted: ${userId}`);
      
      logServiceTrackerEvent({
        serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
        action: "UPDATE_USER_DETAILS_NOT_FOUND",
        status: STATUS_TYPES.FAILURE,
        description: `User details update failed: ${type} not found with ${idField} ${userId}`,
        targetId: userId,
        executedBy: executedBy,
        metadata: { reason: "User not found", type }
      });

      return {
        success: false,
        type: "Conflict",
        message: `${type} not found or deleted.`
      };
    }

    // Step 7: Perform the firstName update (no conflict error here)
    logWithTime(`✏️ Updating firstName for ${type}: ${userId}`);
    
    const updateQuery = { [idField]: userId };
    const updateData = { firstName: firstName.trim() };
    
    const updatedUser = await Model.findOneAndUpdate(
      updateQuery,
      updateData,
      { new: true, lean: true }
    );

    // Step 8: Log success to ServiceTracker
    logWithTime(`✅ Successfully updated firstName for ${type}: ${userId}`);
    
    logServiceTrackerEvent({
      serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
      eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
      action: "UPDATE_USER_DETAILS_SUCCESS",
      status: STATUS_TYPES.SUCCESS,
      description: `${type} firstName updated with ${idField} ${userId}`,
      targetId: userId,
      executedBy: executedBy,
      metadata: { 
        type,
        idField,
        firstName: updatedUser.firstName
      }
    });

    return {
      success: true,
      data: updatedUser,
      message: `${type} firstName updated successfully.`
    };

  } catch (err) {
    logWithTime(`💥 Error in updateUserDetailsService: ${err.message}`);
    
    // Log the error to ServiceTracker
    logServiceTrackerEvent({
      serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
      eventType: SYSTEM_LOG_EVENTS.SYSTEM_ERROR,
      action: "UPDATE_USER_DETAILS_ERROR",
      status: STATUS_TYPES.ERROR,
      description: `Unexpected error during user details update: ${err.message}`,
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
      message: err.message || "An error occurred while updating the user details."
    };
  }
};

module.exports = {
  updateUserDetailsService
};
