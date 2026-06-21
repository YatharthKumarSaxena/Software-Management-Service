// services/common/phase-management.service.js

const mongoose = require("mongoose");
const { Phases, PhaseStatus, WorkflowModes } = require("@configs/enums.config");
const { ProjectModel } = require("@models/project.model");
const { InceptionModel } = require("@models/inception.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { SpecificationModel } = require("@models/specification.model");
const { ValidationModel } = require("@models/validation.model");
const { CONFLICT, INTERNAL_ERROR, BAD_REQUEST } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const {
  getPhaseStatus,
  isPhaseFrozen,
  buildActivePhaseQuery,
  resolveAllowStabilizingRollback,
  canTransitionPhaseStatus
} = require("@utils/phase-status.util");

/**
 * PHASE ORDER MAPPING
 * Determines the sequence of phases in the project lifecycle
 */
const PHASE_ORDER = Object.freeze({
  [Phases.INCEPTION]: 1,
  [Phases.ELICITATION]: 2,
  [Phases.ELABORATION]: 3,
  [Phases.NEGOTIATION]: 4,
  [Phases.SPECIFICATION]: 5,
  [Phases.VALIDATION]: 6
});

const PHASE_FREEZE_EVENT_MAP = {
  [Phases.INCEPTION]: ACTIVITY_TRACKER_EVENTS.FREEZE_INCEPTION,
  [Phases.ELICITATION]: ACTIVITY_TRACKER_EVENTS.FREEZE_ELICITATION,
  [Phases.ELABORATION]: ACTIVITY_TRACKER_EVENTS.FREEZE_ELABORATION,
  [Phases.NEGOTIATION]: ACTIVITY_TRACKER_EVENTS.FREEZE_NEGOTIATION,
  [Phases.SPECIFICATION]: ACTIVITY_TRACKER_EVENTS.FREEZE_SPECIFICATION,
  [Phases.VALIDATION]: ACTIVITY_TRACKER_EVENTS.FREEZE_VALIDATION
};

const PHASE_REOPEN_EVENT_MAP = {
  [Phases.INCEPTION]: ACTIVITY_TRACKER_EVENTS.REOPEN_INCEPTION,
  [Phases.ELICITATION]: ACTIVITY_TRACKER_EVENTS.REOPEN_ELICITATION,
  [Phases.ELABORATION]: ACTIVITY_TRACKER_EVENTS.REOPEN_ELABORATION,
  [Phases.NEGOTIATION]: ACTIVITY_TRACKER_EVENTS.REOPEN_NEGOTIATION,
  [Phases.SPECIFICATION]: ACTIVITY_TRACKER_EVENTS.REOPEN_SPECIFICATION,
  [Phases.VALIDATION]: ACTIVITY_TRACKER_EVENTS.REOPEN_VALIDATION
};

const PHASE_STABILIZE_EVENT_MAP = {
  [Phases.INCEPTION]: ACTIVITY_TRACKER_EVENTS.STABILIZE_INCEPTION,
  [Phases.ELICITATION]: ACTIVITY_TRACKER_EVENTS.STABILIZE_ELICITATION,
  [Phases.ELABORATION]: ACTIVITY_TRACKER_EVENTS.STABILIZE_ELABORATION,
  [Phases.NEGOTIATION]: ACTIVITY_TRACKER_EVENTS.STABILIZE_NEGOTIATION,
  [Phases.SPECIFICATION]: ACTIVITY_TRACKER_EVENTS.STABILIZE_SPECIFICATION,
  [Phases.VALIDATION]: ACTIVITY_TRACKER_EVENTS.STABILIZE_VALIDATION
};

/**
 * MODEL MAPPING
 * Maps phase names to their corresponding Mongoose models
 */
const PHASE_MODEL_MAP = {
  [Phases.INCEPTION]: InceptionModel,
  [Phases.ELICITATION]: ElicitationModel,
  [Phases.ELABORATION]: ElaborationModel,
  [Phases.NEGOTIATION]: NegotiationModel,
  [Phases.SPECIFICATION]: SpecificationModel,
  [Phases.VALIDATION]: ValidationModel
};

/**
 * PHASE EVENT MAPPING
 * Maps phase names to their corresponding activity tracker events
 */
const PHASE_EVENT_MAP = {
  [Phases.INCEPTION]: ACTIVITY_TRACKER_EVENTS.CREATE_INCEPTION,
  [Phases.ELICITATION]: ACTIVITY_TRACKER_EVENTS.CREATE_ELICITATION,
  [Phases.ELABORATION]: ACTIVITY_TRACKER_EVENTS.CREATE_ELABORATION,
  [Phases.NEGOTIATION]: ACTIVITY_TRACKER_EVENTS.CREATE_NEGOTIATION,
  [Phases.SPECIFICATION]: ACTIVITY_TRACKER_EVENTS.CREATE_SPECIFICATION,
  [Phases.VALIDATION]: ACTIVITY_TRACKER_EVENTS.CREATE_VALIDATION
};

const getPhaseStatusTrackerEvent = (
  phase,
  nextStatus
) => {

  if (nextStatus === PhaseStatus.STABILIZING) {
    return PHASE_STABILIZE_EVENT_MAP[phase];
  }

  if (nextStatus === PhaseStatus.OPEN) {
    return PHASE_REOPEN_EVENT_MAP[phase];
  }

  if (nextStatus === PhaseStatus.FROZEN) {
    return PHASE_FREEZE_EVENT_MAP[phase];
  }

  return null;
};

/**
 * Fetches the latest document for a given phase
 *
 * @param {string} phase - Phase name
 * @param {string} projectId - Project MongoDB ObjectId
 * @returns {Object|null} Latest phase document or null if not found
 */
const fetchLatestPhaseDocument = async (phase, projectId) => {
  const PhaseModel = PHASE_MODEL_MAP[phase];
  if (!PhaseModel) {
    logWithTime(`⚠️ [fetchLatestPhaseDocument] Invalid phase: ${phase}`);
    return null;
  }

  const latestDoc = await PhaseModel
    .findOne({ projectId })
    .sort({
      "version.major": -1,
      "version.minor": -1
    })
    .lean();

  return latestDoc || null;
};

/**
 * Creates a new phase document with the specified version
 *
 * @param {Object} params
 * @param {string} params.phase - Phase name
 * @param {string} params.projectId - Project MongoDB ObjectId
 * @param {number} params.majorVersion - Major version number
 * @param {string} params.createdBy - Creator's user ID
 * @param {Object} params.additionalData - Any phase-specific data
 * @returns {Promise<Object>} Created phase document
 */
const createPhaseDocument = async ({
  phase,
  project,
  majorVersion,
  createdBy,
  additionalData = {}
}) => {
  const PhaseModel = PHASE_MODEL_MAP[phase];
  if (!PhaseModel) {
    throw new Error(`Invalid phase: ${phase}`);
  }

  const phaseId = new mongoose.Types.ObjectId();
  const phaseLevelGovernance = project.enablePhaseLevelGovernance;

  const phaseData = {
    _id: phaseId,
    projectId: project._id,
    version: {
      major: majorVersion,
      minor: 0
    },
    createdBy,
    ...additionalData
  };

  phaseData.workflowMode =
    phaseLevelGovernance
      ? (additionalData.workflowMode ?? WorkflowModes.OPEN)
      : (project.workflowMode ?? WorkflowModes.OPEN);

  const createdDoc = await PhaseModel.create(phaseData);

  logWithTime(
    `✅ [createPhaseDocument] ${phase} created: ID=${phaseId}, majorVersion=${majorVersion}`
  );

  return createdDoc;
};

const createPhaseWithVersionManagement = async ({
  project,
  targetPhase,
  createdBy,
  auditContext = {},
  additionalData = {}
}) => {
  try {
    const projectId = project._id.toString();
    const phaseName = targetPhase.charAt(0).toUpperCase() + targetPhase.slice(1);

    // ── Validation ────────────────────────────────────────────────────
    if (!PHASE_MODEL_MAP[targetPhase]) {
      logWithTime(`❌ Invalid target phase: ${targetPhase}`);
      return { success: false, message: `Invalid target phase: ${targetPhase}`, errorCode: BAD_REQUEST };
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      logWithTime(`❌ Invalid projectId: ${projectId}`);
      return { success: false, message: "Invalid project ID", errorCode: BAD_REQUEST };
    }

    // ── Step 1: Block multiple active documents for the SAME phase ────
    // Agar same phase ka already ek active (OPEN/STABILIZING) document hai, toh naya create mat karne do.
    const TargetPhaseModel = PHASE_MODEL_MAP[targetPhase];
    const existingActiveTarget = await TargetPhaseModel
      .findOne(buildActivePhaseQuery(projectId))
      .lean();

    if (existingActiveTarget) {
      logWithTime(`⚠️ [createPhase] ${targetPhase} is already active. Cannot create a new one.`);
      return {
        success: false,
        message: `An active ${targetPhase} phase already exists. Please freeze it before creating a new one.`,
        errorCode: CONFLICT
      };
    }

    if (additionalData.phaseStatus === PhaseStatus.FROZEN) {
      return {
        success: false,
        message: `You cannot create a new phase in FROZEN status. Please create it in OPEN or STABILIZING status first.`,
        errorCode: BAD_REQUEST
      };
    }

    // ── Step 2: Find Max Major Version across ALL phases ──────────────
    let highestMajor = 0;
    let targetPhaseHighestMajor = 0;

    // Track latest workflow position in the highest cycle
    let latestWorkflowOrder = 0;

    // Poori list traverse karke max version find kar rahe hain
    for (const [phase, PhaseModel] of Object.entries(PHASE_MODEL_MAP)) {
      const latestDoc = await PhaseModel
        .findOne({ projectId })
        .sort({
          "version.major": -1,
          "version.minor": -1
        })
        .lean();

      if (latestDoc) {
        const docMajor = latestDoc.version.major;
        const phaseOrder = PHASE_ORDER[phase];

        // Track overall highest major version in the project
        if (docMajor > highestMajor) {
          highestMajor = docMajor;

          // Reset workflow tracking for this newer cycle
          latestWorkflowOrder = phaseOrder;
        }

        // If same major version, track furthest workflow phase
        else if (
          docMajor === highestMajor &&
          phaseOrder > latestWorkflowOrder
        ) {
          latestWorkflowOrder = phaseOrder;
        }

        // Track highest version specifically for target phase
        if (phase === targetPhase && docMajor > targetPhaseHighestMajor) {
          targetPhaseHighestMajor = docMajor;
        }
      }
    }

    const latestTargetDoc = await fetchLatestPhaseDocument(
      targetPhase,
      projectId
    );

    // ── Step 3: Determine New Major Version ───────────────────────────
    let newMajorVersion = 1; // Default for brand new projects

    if (highestMajor > 0) {

      // Reuse deleted untouched draft version
      if (
        latestTargetDoc &&
        latestTargetDoc.isDeleted &&
        latestTargetDoc.version?.minor === 0 &&
        latestTargetDoc.version?.major === highestMajor
      ) {

        newMajorVersion = highestMajor;

      }

      // Backward workflow movement detected
      else if (
        PHASE_ORDER[targetPhase] < latestWorkflowOrder
      ) {

        newMajorVersion = highestMajor + 1;

      }

      // Same phase recreated in current cycle
      else if (
        targetPhaseHighestMajor === highestMajor
      ) {

        newMajorVersion = highestMajor + 1;

      }

      // Forward workflow progression
      else {

        newMajorVersion = highestMajor;

      }
    }

    logWithTime(`🆕 Proceeding with majorVersion=${newMajorVersion} for ${targetPhase}.`);

    // ── Step 4: Create the new phase document ──────────────────────
    const createdPhase = await createPhaseDocument({
      phase: targetPhase,
      project: project,
      majorVersion: newMajorVersion,
      createdBy,
      additionalData
    });

    await ProjectModel.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          currentPhase: targetPhase
        }
      }
    );

    // ── Step 5: Log activity tracker ──────────────────────────────────
    const { oldData, newData } = prepareAuditData(null, createdPhase);
    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      PHASE_EVENT_MAP[targetPhase],
      `${targetPhase} phase created with majorVersion: ${newMajorVersion}, minorVersion: 0 by ${createdBy}`,
      { oldData, newData, adminActions: { targetId: projectId } }
    );

    return { success: true, message: `${phaseName} phase created successfully`, phase: createdPhase, version: { major: newMajorVersion, minor: 0 } };

  } catch (error) {
    logWithTime(`❌ Error: ${error.message}`);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return {
        success: false,
        message: error.message,
        errorCode: BAD_REQUEST
      };
    }
    return { success: false, message: "Internal error while creating phase", error: error.message, errorCode: INTERNAL_ERROR };
  }
};

/**
 * Utility: Get all non-frozen phases for a project
 *
 * @param {string} projectId - Project MongoDB ObjectId
 * @returns {Array} Array of active phases
 */
const getActivePhases = async (projectId) => {
  const activePhases = [];

  for (const [phase] of Object.entries(PHASE_MODEL_MAP)) {
    const PhaseModel = PHASE_MODEL_MAP[phase];
    const activeDoc = await PhaseModel
      .findOne(buildActivePhaseQuery(projectId))
      .lean();

    if (activeDoc) {
      activePhases.push({
        phase,
        document: activeDoc
      });
    }
  }

  return activePhases;
};

const updatePhaseStatus = async ({
  phaseDocument,
  phase,
  nextStatus,
  updatedBy,
  auditContext = {}
}) => {
  const PhaseModel = PHASE_MODEL_MAP[phase];
  if (!PhaseModel) {
    return { success: false, message: `Invalid phase: ${phase}`, errorCode: BAD_REQUEST };
  }

  const phaseName = phase.charAt(0).toUpperCase() + phase.slice(1);

  const currentStatus = getPhaseStatus(phaseDocument);

  if (currentStatus === nextStatus) {
    return {
      success: true,
      alreadyInRequestedStatus: true,
      phase: phaseDocument,
      message: `${phaseName} Phase is already in the requested status.`
    };
  }


  if (currentStatus === PhaseStatus.FROZEN) {
    return {
      success: false,
      message: `${phaseName} Phase is frozen and cannot be modified`,
      errorCode: CONFLICT
    };
  }

  const project = await ProjectModel.findById(phaseDocument.projectId).lean();
  const allowStabilizingRollback = resolveAllowStabilizingRollback(project);

  if (!canTransitionPhaseStatus({ currentStatus, nextStatus, allowStabilizingRollback })) {
    return {
      success: false,
      message: `Phase status transition: ${currentStatus} to ${nextStatus} is not allowed`,
      errorCode: BAD_REQUEST
    };
  }

  const updatedDoc = await PhaseModel.findByIdAndUpdate(
    phaseDocument._id,
    {
      $set: {
        phaseStatus: nextStatus,
        updatedBy
      }
    },
    { new: true, runValidators: true }
  );

  if (nextStatus === PhaseStatus.FROZEN) {
    await ProjectModel.findByIdAndUpdate(
      phaseDocument.projectId,
      { $pull: { currentPhase: phase } }
    );
  }

  const { user, device, requestId } = auditContext || {};
  if (user || updatedBy) {
    const { oldData, newData } = prepareAuditData(phaseDocument, updatedDoc);
    const trackerEvent =
      getPhaseStatusTrackerEvent(
        phase,
        nextStatus
      );
    if (trackerEvent) {
      logActivityTrackerEvent(
        user,
        device,
        requestId,
        trackerEvent,
        `${phaseName} phase status changed from ${currentStatus} to ${nextStatus}`,
        {
          oldData,
          newData,
          adminActions: {
            targetId: phaseDocument.projectId?.toString()
          }
        }
      );
    }
  }

  return { success: true, alreadyInRequestedStatus: false, message: `Phase status for ${phaseName} Phase updated from ${currentStatus} to ${nextStatus}`, phase: updatedDoc };
};

/**
 * Utility: Get phase order value
 *
 * @param {string} phase - Phase name
 * @returns {number|null} Phase order or null if invalid
 */
const getPhaseOrder = (phase) => {
  return PHASE_ORDER[phase] || null;
};

module.exports = {
  // Main service
  createPhaseWithVersionManagement,

  // Utilities
  fetchLatestPhaseDocument,
  updatePhaseStatus,
  createPhaseDocument,
  getActivePhases,
  isPhaseFrozen,
  getPhaseOrder,

  // Constants
  PHASE_ORDER,
  PHASE_MODEL_MAP
};
