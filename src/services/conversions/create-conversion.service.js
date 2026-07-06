// services/conversions/create-conversion.service.js

const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { ConversionModel } = require("@models/conversion.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { isConversionAllowed, getEventsForCollection } = require("@configs/conversion-matrix.config");
const { compareDirectConversion } = require("../../utils/direct-comparison.util");
const { ConversionTypes } = require("@/configs/enums.config");
const { counterServices } = require("@services/common/counter.service");
const mongoose = require("mongoose");

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

    const sourceEvents = getEventsForCollection(sourceCollection);
    const targetEvents = getEventsForCollection(targetCollection);

    if (!sourceEvents || !targetEvents) {
      return {
        success: false,
        message: "Unsupported collections for conversion events"
      };
    }

    // 5. Exact Activity Matching
    const deleteEvent = sourceEvents.DELETE;
    const createEvent = targetEvents.CREATE;

    // 4. Fetch Activities for the workflow and user
    const activities = await ActivityTrackerModel
      .find({ workflowId, userId, deviceUUID, eventType: { $in: [createEvent, deleteEvent] } })
      .sort({ createdAt: 1 })
      .lean();

    if (activities.length !== 2) {
      return {
        success: false,
        message: "A conversion workflow must contain exactly one CREATE activity and one DELETE activity."
      };
    }

    const createActivity = activities.find(a =>
      a.eventType === createEvent &&
      a.userActions?.performedOn === targetCollection &&
      String(a.userActions?.targetId) === String(targetEntityId)
    );

    const deleteActivity = activities.find(a =>
      a.eventType === deleteEvent &&
      a.userActions?.performedOn === sourceCollection &&
      String(a.userActions?.targetId) === String(sourceEntityId)
    );

    if (!createActivity) {
      return { success: false, message: `Exact Create activity (${createEvent}) for target entity not found in workflow` };
    }
    if (!deleteActivity) {
      return { success: false, message: `Exact Delete activity (${deleteEvent}) for source entity not found in workflow` };
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

    const SourceModel = mongoose.model(sourceCollection);
    const TargetModel = mongoose.model(targetCollection);

    const sourceEntity = await SourceModel.findById(sourceEntityId).lean();
    const targetEntity = await TargetModel.findById(targetEntityId).lean();

    if (!sourceEntity || !targetEntity) {
      return {
        success: false,
        message: "Source or target entity not found."
      };
    }

    let conversionType = ConversionTypes.DIRECT;
    // 8. DIRECT Conversion Validation
    const comparison = compareDirectConversion(sourceEntity, targetEntity);
    if (!comparison.valid) {
      conversionType = ConversionTypes.INDIRECT;
    }

    // ── Call counter service to get sequence and id ──────────────────────────
    const counterResult = await counterServices.conversionCounterService(projectId);
    if (!counterResult.success) {
      logWithTime(`❌ [createConversionService] Error generating Conversion sequence for project: ${projectId}`);
      return { success: false, message: "Failed to generate Conversion sequence", errorCode: INTERNAL_ERROR };
    }

    // 9. Persist Conversion Mapping
    const conversion = new ConversionModel({
      workflowId,
      userId,
      projectId,
      sequence: counterResult.sequence,
      id: counterResult.generatedId,
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
        userActions: { targetId: conversion._id, performedOn: DB_COLLECTIONS.CONVERSIONS }
      }
    });

    return { success: true, conversion };
  } catch (error) {
    return { success: false, message: "Internal server error", error: error.message };
  }
};

module.exports = { createConversionService };
