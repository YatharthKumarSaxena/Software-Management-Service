// services/common/phase-management.service.js

const mongoose = require("mongoose");
const { Phases } = require("@configs/enums.config");
const { InceptionModel } = require("@models/inception.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { SpecificationModel } = require("@models/specification.model");
const { ValidationModel } = require("@models/validation.model");
const { CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");

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
    .findOne({ projectId, isDeleted: false })
    .sort({ "version.major": -1 })
    .lean();

  return latestDoc || null;
};

/**
 * Finds the active (non-frozen) phase for a project
 *
 * @param {string} projectId - Project MongoDB ObjectId
 * @returns {Object|null} Object with { phase, document } or null if no active phase
 */
const findActivePhase = async (projectId) => {
  for (const [phase] of Object.entries(PHASE_MODEL_MAP)) {
    const PhaseModel = PHASE_MODEL_MAP[phase];

    const activeDoc = await PhaseModel
      .findOne({ projectId, isDeleted: false, isFrozen: false })
      .lean();

    if (activeDoc) {
      return { phase, document: activeDoc };
    }
  }

  return null;
};

/**
 * Freezes a phase document
 *
 * @param {Object} phaseDocument - The phase document to freeze
 * @param {string} phase - Phase name
 * @param {Object} params - Optional audit context { user, device, requestId }
 * @returns {Promise<boolean>} Success flag
 */
const freezePhase = async (phaseDocument, phase, params = {}) => {
  const PhaseModel = PHASE_MODEL_MAP[phase];
  if (!PhaseModel) {
    return false;
  }

  try {
    const oldDocCopy = { ...phaseDocument.toObject ? phaseDocument.toObject() : phaseDocument };

    const updatedDoc = await PhaseModel.findByIdAndUpdate(
      phaseDocument._id,
      { isFrozen: true },
      { new: true }
    );

    logWithTime(`✅ [freezePhase] ${phase} frozen with majorVersion: ${phaseDocument.version.major}`);

    // Log activity tracker for phase freeze
    const { user, device, requestId, createdBy } = params;
    if (user || createdBy) {
      const { oldData, newData } = prepareAuditData(oldDocCopy, updatedDoc);
      logActivityTrackerEvent(
        user,
        device,
        requestId,
        PHASE_EVENT_MAP[phase],
        `${phase} phase frozen (majorVersion: ${phaseDocument.version.major}) - transitioning to next phase`,
        {
          oldData,
          newData,
          adminActions: { targetId: phaseDocument.projectId?.toString() }
        }
      );
    }

    return true;
  } catch (error) {
    logWithTime(`❌ [freezePhase] Error freezing ${phase}: ${error.message}`);
    return false;
  }
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
  projectId,
  majorVersion,
  createdBy,
  additionalData = {}
}) => {
  const PhaseModel = PHASE_MODEL_MAP[phase];
  if (!PhaseModel) {
    throw new Error(`Invalid phase: ${phase}`);
  }

  const phaseId = new mongoose.Types.ObjectId();

  const phaseData = {
    _id: phaseId,
    projectId: new mongoose.Types.ObjectId(projectId),
    createdBy,
    version: {
      major: majorVersion,
      minor: 0
    },
    isDeleted: false,
    isFrozen: false,
    ...additionalData
  };

  const createdDoc = await PhaseModel.create(phaseData);

  logWithTime(
    `✅ [createPhaseDocument] ${phase} created: ID=${phaseId}, majorVersion=${majorVersion}`
  );

  return createdDoc;
};

const createPhaseWithVersionManagement = async ({
  project,
  createdBy,
  auditContext = {},
  additionalData = {}
}) => {
  try {
    const targetPhase = project.currentPhase;
    const projectId = project._id.toString();
    // ── Validation ────────────────────────────────────────────────────
    if (!PHASE_MODEL_MAP[targetPhase]) {
      logWithTime(`❌ Invalid target phase: ${targetPhase}`);
      return { success: false, message: `Invalid target phase: ${targetPhase}`, errorCode: 400 };
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      logWithTime(`❌ Invalid projectId: ${projectId}`);
      return { success: false, message: "Invalid project ID", errorCode: 400 };
    }

    // ── Step 1 & 2: Find active phase ──────────────────────────────────
    const activePhaseInfo = await findActivePhase(projectId);
    let newMajorVersion = 1;

    // ── Step 3: Apply transition logic ─────────────────────────────
    if (activePhaseInfo) {
      const activePhase = activePhaseInfo.phase;
      const activeDoc = activePhaseInfo.document;
      const activeMajorVersion = activeDoc.version.major;
      const activePhaseOrder = PHASE_ORDER[activePhase]; // Typo fixed here
      const targetPhaseOrder = PHASE_ORDER[targetPhase];

      // ── CASE 1: Forward Movement ───────────────────────────────────
      if (activePhaseOrder < targetPhaseOrder) {
        const freezeSuccess = await freezePhase(activeDoc, activePhase, {
          user: auditContext?.user, device: auditContext?.device, requestId: auditContext?.requestId, createdBy
        });
        if (!freezeSuccess) return { success: false, message: `Failed to freeze ${activePhase}`, errorCode: INTERNAL_ERROR };

        newMajorVersion = activeMajorVersion;
      }
      // ── CASE 2: Backward Movement ──────────────────────────────────
      else if (activePhaseOrder > targetPhaseOrder) {
        const freezeSuccess = await freezePhase(activeDoc, activePhase, {
          user: auditContext?.user, device: auditContext?.device, requestId: auditContext?.requestId, createdBy
        });
        if (!freezeSuccess) return { success: false, message: `Failed to freeze ${activePhase}`, errorCode: INTERNAL_ERROR };

        newMajorVersion = activeMajorVersion + 1;
      }
      // ── CASE 2.5: Same Phase ───────────────────────────────────────
      else {
        return { success: false, message: `${targetPhase} is already active for this project`, errorCode: CONFLICT };
      }
    }
    // ── CASE 3: No Active Phase ────────────────────────────────────
    else {
      let highestMajor = 0;
      let targetPhaseLatestMajor = 0;

      for (const [phase] of Object.entries(PHASE_MODEL_MAP)) {
        const latestDoc = await fetchLatestPhaseDocument(phase, projectId);
        if (latestDoc) {
          // Track highest overall version in the project
          if (latestDoc.version.major > highestMajor) {
            highestMajor = latestDoc.version.major;
          }
          // Track the highest version specifically for our target phase
          if (phase === targetPhase) {
            targetPhaseLatestMajor = latestDoc.version.major;
          }
        }
      }

      if (highestMajor === 0) {
        // Scenario A: Brand new project, no phases exist at all
        newMajorVersion = 1;
      } else if (targetPhaseLatestMajor === highestMajor) {
        // Scenario B: Target phase ALREADY exists in the current highest cycle!
        // This means user froze it and is re-creating it. We MUST bump the cycle.
        newMajorVersion = highestMajor + 1;
      } else {
        // Scenario C: Normal forward movement (e.g., Inception v1 frozen -> Creating Elicitation)
        // Elicitation doesn't have v1 yet, so it's safe to use highestMajor.
        newMajorVersion = highestMajor;
      }

      logWithTime(`🆕 CASE 3 - No active phase. Continuing with majorVersion=${newMajorVersion}.`);
    }

    // ── Step 4: Create the new phase document ──────────────────────
    const createdPhase = await createPhaseDocument({
      phase: targetPhase,
      projectId,
      majorVersion: newMajorVersion,
      createdBy,
      additionalData
    });

    // ── Step 5: Log activity tracker ───────────────────────────────────────
    const { oldData, newData } = prepareAuditData(null, createdPhase);
    logActivityTrackerEvent(
      auditContext?.user, auditContext?.device, auditContext?.requestId,
      PHASE_EVENT_MAP[targetPhase],
      `${targetPhase} phase created with majorVersion: ${newMajorVersion}, minorVersion: 0 by ${createdBy}`,
      { oldData, newData, adminActions: { targetId: projectId } }
    );

    return { success: true, phase: createdPhase, version: { major: newMajorVersion, minor: 0 } };

  } catch (error) {
    logWithTime(`❌ Error: ${error.message}`);
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
      .findOne({ projectId, isDeleted: false, isFrozen: false })
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
  findActivePhase,
  fetchLatestPhaseDocument,
  freezePhase,
  createPhaseDocument,
  getActivePhases,
  getPhaseOrder,

  // Constants
  PHASE_ORDER,
  PHASE_MODEL_MAP
};
