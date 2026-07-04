// services/conversions/create-conversion.service.js

const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { ConversionModel } = require("@models/conversion.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { isConversionAllowed, getEventsForCollection } = require("@configs/conversion-matrix.config");
const { compareDirectConversion } = require("../../utils/direct-comparison.util");
const { ConversionTypes } = require("@/configs/enums.config");

/**
 * Creates a conversion record after validating the workflow.
 * @param {Object} params
 * @param {String} params.workflowId
 * @param {String} params.projectId
 * @param {String} params.sourceEntityId
 * @param {String} params.sourceCollection
 * @param {String} params.targetEntityId
 * @param {String} params.targetCollection
 * @param {Object} params.auditContext
 * @returns {Object} { success, message, conversion, error }
 */
const createConversionService = async ({
  workflowId,
  projectId,
  sourceEntityId,
  sourceCollection,
  targetEntityId,
  targetCollection,
  auditContext,
}) => {
  try {
    const { user, device, requestId } = auditContext;
    const userId = user.adminId || user.clientId;
    const deviceUUID = device.deviceUUID;

    // 1. Validate Conversion Matrix (Security/Business Rule)
    if (!isConversionAllowed(sourceCollection, targetCollection)) {
      return { success: false, message: `Conversion from ${sourceCollection} to ${targetCollection} is not allowed` };
    }

    // 2. Duplicate Conversion Mapping Check (Source Entity Check)
    const existingSourceConversion = await ConversionModel.findOne({ sourceEntityId }).lean();
    if (existingSourceConversion) {
      if (existingSourceConversion.workflowId === workflowId) {
        return { success: true, conversion: existingSourceConversion, message: "Conversion already completed (Idempotent)" };
      }
      return { success: false, message: "Source entity has already been converted in another workflow" };
    }

    // 3. Duplicate Workflow Check (Idempotency)
    const existingWorkflowConversion = await ConversionModel.findOne({ workflowId, projectId, userId, deviceUUID }).lean();
    if (existingWorkflowConversion) {
      return { success: true, conversion: existingWorkflowConversion, message: "Conversion already completed (Idempotent)" };
    }

    // 4. Fetch Activities for the workflow and user
    const activities = await ActivityTrackerModel
      .find({ workflowId, userId, deviceUUID })
      .sort({ createdAt: 1 })
      .lean();

    if (activities.length !== 2) {
      return {
        success: false,
        message: "A conversion workflow must contain exactly one CREATE activity and one DELETE activity."
      };
    }

    // 5. Exact Activity Matching
    const eventsConfig = getEventsForCollection(sourceCollection);
    const targetEventsConfig = getEventsForCollection(targetCollection);

    if (!eventsConfig || !targetEventsConfig) {
      return { success: false, message: "Unsupported collections for conversion events" };
    }

    const expectedDeleteEvent = eventsConfig.DELETE;
    const expectedCreateEvent = targetEventsConfig.CREATE;

    const createActivity = activities.find(a =>
      a.eventType === expectedCreateEvent &&
      a.adminActions?.performedOn === targetCollection &&
      String(a.adminActions?.targetId) === String(targetEntityId)
    );

    const deleteActivity = activities.find(a =>
      a.eventType === expectedDeleteEvent &&
      a.adminActions?.performedOn === sourceCollection &&
      String(a.adminActions?.targetId) === String(sourceEntityId)
    );

    if (!createActivity) {
      return { success: false, message: `Exact Create activity (${expectedCreateEvent}) for target entity not found in workflow` };
    }
    if (!deleteActivity) {
      return { success: false, message: `Exact Delete activity (${expectedDeleteEvent}) for source entity not found in workflow` };
    }

    // 6. Activity sequence (Create must occur before Delete)
    if (new Date(createActivity.createdAt) > new Date(deleteActivity.createdAt)) {
      return { success: false, message: "Create activity must occur before Delete activity" };
    }

    // 7. Project Security Validation
    const createProject = createActivity.newData?.projectId || createActivity.oldData?.projectId;
    const deleteProject = deleteActivity.oldData?.projectId || deleteActivity.newData?.projectId;

    if ((createProject && String(createProject) !== String(projectId)) ||
      (deleteProject && String(deleteProject) !== String(projectId))) {
      return { success: false, message: "Workflow activities do not belong to the specified project" };
    }

    let conversionType = ConversionTypes.DIRECT;
    // 8. DIRECT Conversion Validation
    const comparison = compareDirectConversion(deleteActivity.oldData, createActivity.newData);
    if (!comparison.valid) {
      conversionType = ConversionTypes.INDIRECT;
    }

    // 9. Persist Conversion Mapping
    const conversion = new ConversionModel({
      workflowId,
      userId,
      projectId,
      sourceEntityId,
      sourceCollection,
      targetEntityId,
      targetCollection,
      conversionType,
      deviceUUID,
      createActivityId: createActivity._id,
      deleteActivityId: deleteActivity._id
    });

    await conversion.save();

    // 10. Log Conversion Activity
    logActivityTrackerEvent({
      user,
      device,
      requestId,
      eventType: ACTIVITY_TRACKER_EVENTS.CREATE_CONVERSION,
      description: `Converted ${sourceCollection} (${sourceEntityId}) to ${targetCollection} (${targetEntityId})`,
      logOptions: {
        oldData: { sourceEntityId, sourceCollection, projectId },
        newData: { targetEntityId, targetCollection, conversionId: conversion._id, projectId },
        adminActions: { targetId: conversion._id, performedOn: DB_COLLECTIONS.CONVERSIONS }
      }
    });

    return { success: true, conversion };
  } catch (error) {
    return { success: false, message: "Internal server error", error: error.message };
  }
};

module.exports = { createConversionService };
