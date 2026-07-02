const mongoose = require("mongoose");
const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { descriptionLength } = require("@/configs/fields-length.config");
const { ACTIVITY_TRACKING_ENABLED, ADVANCED_LOGGING_ENABLED } = require("@/configs/security.config");
const { isValidUUID } = require("@/utils/id-validators.util");

/**
 * Collections that use MongoDB ObjectId for their primary IDs
 * These targetIds should be stored as ObjectId in the activity tracker
 * Note: ADMINS and USERS use String IDs (customIdRegex), not ObjectId
 */
const OBJECTID_COLLECTIONS = Object.values(DB_COLLECTIONS);

/**
 * Convert targetId to MongoDB ObjectId if needed
 * @param {string|ObjectId} targetId - The target ID to convert
 * @param {string} performedOn - The collection name
 * @returns {ObjectId|string} - Converted or original ID
 */
const convertTargetIdIfNeeded = (targetId, performedOn) => {
  if (!targetId) return null;

  // If the collection uses ObjectIds, convert string to ObjectId
  if (OBJECTID_COLLECTIONS.includes(performedOn)) {
    if (typeof targetId === 'string') {
      try {
        return new mongoose.Types.ObjectId(targetId);
      } catch (err) {
        logWithTime(`⚠️ Invalid ObjectId format for targetId: ${targetId}`);
        return null;
      }
    }
  }

  return targetId;
};

/**
 * Validate reasonDescription length
 * @param {string} reasonDescription - The reason description
 * @returns {boolean} - True if valid
 */
const isValidReasonDescription = (reasonDescription) => {
  // Empty string or whitespace-only strings are considered invalid/not provided
  if (!reasonDescription || typeof reasonDescription !== 'string' || reasonDescription.trim() === '') {
    return false; // Don't set empty values
  }
  const { min, max } = descriptionLength;
  return reasonDescription.length >= min && reasonDescription.length <= max;
};

/**
 * Logs a user activity event (fire-and-forget)
 * Supports both admin and client records
 * @param {Object} user - User object (admin or client) with adminId/clientId and adminType/clientType
 * @param {Object} device - Device info with deviceUUID
 * @param {string} requestId - Request ID for tracking
 * @param {string} eventType - Type of event from ACTIVITY_TRACKER_EVENTS
 * @param {string} description - Event description
 * @param {Object} logOptions - Optional logging options (oldData, newData, adminActions, etc)
 */
const logActivityTrackerEvent = (

  user,

  device,

  requestId,

  eventType,

  description,

  logOptions = {},

  workflowId = null
) => {
  (async () => {
    try {
      // Check if activity tracking is enabled
      if (!ACTIVITY_TRACKING_ENABLED) {
        return;
      }

      const validEvents = Object.values(ACTIVITY_TRACKER_EVENTS);
      const validCollections = Object.values(DB_COLLECTIONS);

      // Validate eventType
      if (!validEvents.includes(eventType)) {
        logWithTime(`⚠️ Invalid eventType: ${eventType}. Skipping activity log.`);
        return;
      }

      // Validate user (can be admin or client)
      if (!user?.adminId && !user?.clientId) {
        logWithTime("⚠️ Missing user information (adminId or clientId). Skipping activity log.");
        return;
      }

      // Validate Device UUID
      if (!device?.deviceUUID) {
        logWithTime("⚠️ Missing device UUID. Skipping activity log.");
        return;
      }

      // Validate requestId
      if (!requestId) {
        logWithTime("⚠️ Missing requestId. Skipping activity log.");
        return;
      }

      // Validate workflowId
      if (workflowId !== null && !isValidUUID(workflowId)) {
        logWithTime("❌ Invalid workflowId. Skipping activity log.");
        return;
      }

      // Base Log Object (matches schema)
      const baseLog = {
        userId: user?.adminId || user?.clientId, // Required field - use whichever is available
        userType: user?.adminType || user?.clientType, // Optional user type
        requestId: requestId,
        deviceUUID: device.deviceUUID,
        deviceType: device.deviceType || null,
        deviceName: device.deviceName || null,
        eventType,
        description: description || `Performed ${eventType} by ${user?.adminId || user?.clientId}`,
        workflowId: workflowId || null,
        oldData: logOptions.oldData || null,
        newData: logOptions.newData || null,
      };

      // Process Admin Actions
      const adminActions = {};
      const { adminActions: adminActionsInput } = logOptions;

      if (adminActionsInput) {
        const { targetId, performedOn, reason, reasonDescription, queryFilter, filter } = adminActionsInput;

        // Validate and set targetId (convert to ObjectId if needed)
        if (targetId !== undefined && targetId !== null) {
          // Validate performedOn when targetId is present
          if (performedOn && !validCollections.includes(performedOn)) {
            logWithTime(`⚠️ Invalid performedOn collection: ${performedOn}. Skipping targetId.`);
          } else {
            adminActions.targetId = convertTargetIdIfNeeded(targetId, performedOn);
            if (performedOn) {
              adminActions.performedOn = performedOn;
            }
          }
        }

        // Validate and set reason
        if (reason !== undefined && reason !== null) {
          adminActions.reason = reason;

          // Set reasonDescription only if reason is present
          if (reasonDescription !== undefined && reasonDescription !== null) {
            if (!isValidReasonDescription(reasonDescription)) {
              logWithTime(
                `⚠️ reasonDescription length invalid (${descriptionLength.min}-${descriptionLength.max}). Skipping.`
              );
            } else {
              adminActions.reasonDescription = reasonDescription;
            }
          }
        }

        // Add queryFilter if advanced logging is enabled
        if (ADVANCED_LOGGING_ENABLED && queryFilter !== undefined && queryFilter !== null) {
          adminActions.queryFilter = queryFilter;
        }

        // Validate and set filter array
        if (Array.isArray(filter) && filter.length > 0) {
          const validFilters = filter.filter((f) => validEvents.includes(f));

          if (validFilters.length > 0) {
            adminActions.filter = validFilters;
          }
        }
      }

      // Attach adminActions only if it has content
      if (Object.keys(adminActions).length > 0) {
        baseLog.adminActions = adminActions;
      }

      // Save atomically using create()
      await ActivityTrackerModel.create(baseLog);

      const userIdentifier = user?.adminId ? `Admin: ${user.adminId}` : `Client: ${user?.clientId}`;
      logWithTime(
        `📘 ActivityTracker saved: ${eventType} | ${userIdentifier} | RequestId: ${requestId}`
      );
    } catch (err) {
      logWithTime(
        `❌ Error saving ActivityTracker for event: ${eventType}`
      );
      errorMessage(err);
    }
  })();
};

module.exports = {
  logActivityTrackerEvent,
};