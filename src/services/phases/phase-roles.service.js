// services/phases/phase-roles.service.js

const { NegotiationModel } = require("@models/negotiation.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, CONFLICT, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
const { AllowedPhaseTypes } = require("@/configs/enums.config");
const { isPhaseFrozen } = require("@utils/phase-status.util");

// Map phase types to models
const phaseModels = {
  [AllowedPhaseTypes.NEGOTIATION]: NegotiationModel,
  [AllowedPhaseTypes.ELICITATION]: ElicitationModel,
  [AllowedPhaseTypes.ELABORATION]: ElaborationModel
};

/**
 * Add a contributor to a phase
 */
const addContributorService = async ({ phaseType, phaseId, adminId, projectId, auditContext }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (isPhaseFrozen(phase)) {
      return { success: false, message: `${phaseType} is frozen`, errorCode: BAD_REQUEST };
    }

    // Check if stakeholder exists in project
    const stakeholder = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: `Stakeholder not found in this project`, errorCode: NOT_FOUND };
    }

    // Check for conflict - already exist as contributor
    if (phase.contributors?.includes(adminId)) {
      return { success: false, message: `Stakeholder is already a contributor`, errorCode: CONFLICT };
    }

    const updated = await PhaseModel.findByIdAndUpdate(
      phaseId,
      { $addToSet: { contributors: adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(phase, updated);

    logActivityTrackerEvent(
      auditContext?.user,
      auditContext?.device,
      auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.CONTRIBUTOR_ADDED,
      `Contributor added to ${phaseType}: "${stakeholder.name}"`,
      { ...auditData, phaseType, phaseId, stakeholderId: adminId }
    );

    return { success: true, phase: updated };
  } catch (error) {
    logWithTime(`❌ [addContributorService] Error: ${error.message}`);
    return { success: false, message: "Error adding contributor", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Remove a contributor from a phase
 */
const removeContributorService = async ({ phaseType, phaseId, adminId, projectId, auditContext }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (isPhaseFrozen(phase)) {
      return { success: false, message: `${phaseType} is frozen`, errorCode: BAD_REQUEST };
    }

    const stakeholder = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: `Stakeholder not found in this project`, errorCode: NOT_FOUND };
    }

    // Check if actually a contributor
    if (!phase.contributors?.includes(adminId)) {
      return { success: false, message: `Stakeholder is not a contributor`, errorCode: CONFLICT };
    }

    const updated = await PhaseModel.findByIdAndUpdate(
      phaseId,
      { $pull: { contributors: adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(phase, updated);

    logActivityTrackerEvent(
      auditContext?.user,
      auditContext?.device,
      auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.CONTRIBUTOR_REMOVED,
      `Contributor removed from ${phaseType}: "${stakeholder.name}"`,
      { ...auditData, phaseType, phaseId, stakeholderId: adminId }
    );

    return { success: true, phase: updated };
  } catch (error) {
    logWithTime(`❌ [removeContributorService] Error: ${error.message}`);
    return { success: false, message: "Error removing contributor", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Add a reviewer to a phase
 */
const addReviewerService = async ({ phaseType, phaseId, adminId, projectId, auditContext }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (isPhaseFrozen(phase)) {
      return { success: false, message: `${phaseType} is frozen`, errorCode: BAD_REQUEST };
    }

    const stakeholder = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: `Stakeholder not found in this project`, errorCode: NOT_FOUND };
    }

    // Check for conflicts
    if (phase.reviewers?.includes(adminId)) {
      return { success: false, message: `Stakeholder is already a reviewer`, errorCode: CONFLICT };
    }

    if (phase.approvers?.includes(adminId)) {
      return { success: false, message: `Stakeholder is already an approver`, errorCode: CONFLICT };
    }

    const updated = await PhaseModel.findByIdAndUpdate(
      phaseId,
      { $addToSet: { reviewers: adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(phase, updated);

    logActivityTrackerEvent(
      auditContext?.user,
      auditContext?.device,
      auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REVIEWER_ADDED,
      `Reviewer added to ${phaseType}: "${stakeholder.name}"`,
      { ...auditData, phaseType, phaseId, stakeholderId: adminId }
    );

    return { success: true, phase: updated };
  } catch (error) {
    logWithTime(`❌ [addReviewerService] Error: ${error.message}`);
    return { success: false, message: "Error adding reviewer", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Remove a reviewer from a phase
 */
const removeReviewerService = async ({ phaseType, phaseId, adminId, projectId, auditContext }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (isPhaseFrozen(phase)) {
      return { success: false, message: `${phaseType} is frozen`, errorCode: BAD_REQUEST };
    }

    const stakeholder = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: `Stakeholder not found in this project`, errorCode: NOT_FOUND };
    }

    if (!phase.reviewers?.includes(adminId)) {
      return { success: false, message: `Stakeholder is not a reviewer`, errorCode: CONFLICT };
    }

    const updated = await PhaseModel.findByIdAndUpdate(
      phaseId,
      { $pull: { reviewers: adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(phase, updated);

    logActivityTrackerEvent(
      auditContext?.user,
      auditContext?.device,
      auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.REVIEWER_REMOVED,
      `Reviewer removed from ${phaseType}: "${stakeholder.name}"`,
      { ...auditData, phaseType, phaseId, stakeholderId: adminId }
    );

    return { success: true, phase: updated };
  } catch (error) {
    logWithTime(`❌ [removeReviewerService] Error: ${error.message}`);
    return { success: false, message: "Error removing reviewer", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Add an approver to a phase
 */
const addApproverService = async ({ phaseType, phaseId, adminId, projectId, auditContext }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (isPhaseFrozen(phase)) {
      return { success: false, message: `${phaseType} is frozen`, errorCode: BAD_REQUEST };
    }

    const stakeholder = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: `Stakeholder not found in this project`, errorCode: NOT_FOUND };
    }

    // Check for conflicts
    if (phase.approvers?.includes(adminId)) {
      return { success: false, message: `Stakeholder is already an approver`, errorCode: CONFLICT };
    }

    const updated = await PhaseModel.findByIdAndUpdate(
      phaseId,
      { $addToSet: { approvers: adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(phase, updated);

    logActivityTrackerEvent(
      auditContext?.user,
      auditContext?.device,
      auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.APPROVER_ADDED,
      `Approver added to ${phaseType}: "${stakeholder.name}"`,
      { ...auditData, phaseType, phaseId, stakeholderId: adminId }
    );

    return { success: true, phase: updated };
  } catch (error) {
    logWithTime(`❌ [addApproverService] Error: ${error.message}`);
    return { success: false, message: "Error adding approver", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Remove an approver from a phase
 */
const removeApproverService = async ({ phaseType, phaseId, adminId, projectId, auditContext }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (isPhaseFrozen(phase)) {
      return { success: false, message: `${phaseType} is frozen`, errorCode: BAD_REQUEST };
    }

    const stakeholder = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    });

    if (!stakeholder) {
      return { success: false, message: `Stakeholder not found in this project`, errorCode: NOT_FOUND };
    }

    if (!phase.approvers?.includes(adminId)) {
      return { success: false, message: `Stakeholder is not an approver`, errorCode: CONFLICT };
    }

    const updated = await PhaseModel.findByIdAndUpdate(
      phaseId,
      { $pull: { approvers: adminId } },
      { new: true }
    );

    const auditData = prepareAuditData(phase, updated);

    logActivityTrackerEvent(
      auditContext?.user,
      auditContext?.device,
      auditContext?.requestId,
      ACTIVITY_TRACKER_EVENTS.APPROVER_REMOVED,
      `Approver removed from ${phaseType}: "${stakeholder.name}"`,
      { ...auditData, phaseType, phaseId, stakeholderId: adminId }
    );

    return { success: true, phase: updated };
  } catch (error) {
    logWithTime(`❌ [removeApproverService] Error: ${error.message}`);
    return { success: false, message: "Error removing approver", errorCode: INTERNAL_ERROR };
  }
};

/**
 * List contributors with full details
 */
const listContributorsService = async ({ phaseType, phaseId, projectId }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    const contributors = await StakeholderModel.find({
      _id: { $in: phase.contributors || [] },
      projectId,
      isDeleted: false
    }).select("_id name projectRole email");

    return { success: true, contributors };
  } catch (error) {
    logWithTime(`❌ [listContributorsService] Error: ${error.message}`);
    return { success: false, message: "Error listing contributors", errorCode: INTERNAL_ERROR };
  }
};

/**
 * List reviewers with full details
 */
const listReviewersService = async ({ phaseType, phaseId, projectId }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    const reviewers = await StakeholderModel.find({
      _id: { $in: phase.reviewers || [] },
      projectId,
      isDeleted: false
    }).select("_id name projectRole email");

    return { success: true, reviewers };
  } catch (error) {
    logWithTime(`❌ [listReviewersService] Error: ${error.message}`);
    return { success: false, message: "Error listing reviewers", errorCode: INTERNAL_ERROR };
  }
};

/**
 * List approvers with full details
 */
const listApproversService = async ({ phaseType, phaseId, projectId }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    const approvers = await StakeholderModel.find({
      _id: { $in: phase.approvers || [] },
      projectId,
      isDeleted: false
    }).select("_id name projectRole email");

    return { success: true, approvers };
  } catch (error) {
    logWithTime(`❌ [listApproversService] Error: ${error.message}`);
    return { success: false, message: "Error listing approvers", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Get specific contributor details
 */
const getContributorService = async ({ phaseType, phaseId, adminId, projectId }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (!phase.contributors?.includes(adminId)) {
      return { success: false, message: `Stakeholder is not a contributor`, errorCode: NOT_FOUND };
    }

    const contributor = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    }).select("_id name projectRole email");

    if (!contributor) {
      return { success: false, message: `Stakeholder not found`, errorCode: NOT_FOUND };
    }

    return { success: true, contributor };
  } catch (error) {
    logWithTime(`❌ [getContributorService] Error: ${error.message}`);
    return { success: false, message: "Error fetching contributor", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Get specific reviewer details
 */
const getReviewerService = async ({ phaseType, phaseId, adminId, projectId }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (!phase.reviewers?.includes(adminId)) {
      return { success: false, message: `Stakeholder is not a reviewer`, errorCode: NOT_FOUND };
    }

    const reviewer = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    }).select("_id name projectRole email");

    if (!reviewer) {
      return { success: false, message: `Stakeholder not found`, errorCode: NOT_FOUND };
    }

    return { success: true, reviewer };
  } catch (error) {
    logWithTime(`❌ [getReviewerService] Error: ${error.message}`);
    return { success: false, message: "Error fetching reviewer", errorCode: INTERNAL_ERROR };
  }
};

/**
 * Get specific approver details
 */
const getApproverService = async ({ phaseType, phaseId, adminId, projectId }) => {
  try {
    const PhaseModel = phaseModels[phaseType];
    if (!PhaseModel) {
      return { success: false, message: `Invalid phase type: ${phaseType}`, errorCode: BAD_REQUEST };
    }

    const phase = await PhaseModel.findOne({ _id: phaseId, isDeleted: false });
    if (!phase) {
      return { success: false, message: `${phaseType} not found`, errorCode: NOT_FOUND };
    }

    if (!phase.approvers?.includes(adminId)) {
      return { success: false, message: `Stakeholder is not an approver`, errorCode: NOT_FOUND };
    }

    const approver = await StakeholderModel.findOne({
      _id: adminId,
      projectId,
      isDeleted: false
    }).select("_id name projectRole email");

    if (!approver) {
      return { success: false, message: `Stakeholder not found`, errorCode: NOT_FOUND };
    }

    return { success: true, approver };
  } catch (error) {
    logWithTime(`❌ [getApproverService] Error: ${error.message}`);
    return { success: false, message: "Error fetching approver", errorCode: INTERNAL_ERROR };
  }
};

module.exports = {
  addContributorService,
  removeContributorService,
  addReviewerService,
  removeReviewerService,
  addApproverService,
  removeApproverService,
  listContributorsService,
  listReviewersService,
  listApproversService,
  getContributorService,
  getReviewerService,
  getApproverService
};
