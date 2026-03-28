// services/common/version.service.js

const { Phases } = require("@configs/enums.config");
const { InceptionModel } = require("@models/inception.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { SpecificationModel } = require("@models/specification.model");
const { ValidationModel } = require("@models/validation.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");

const PHASE_MODEL_MAP = {
  [Phases.INCEPTION]: InceptionModel,
  [Phases.ELICITATION]: ElicitationModel,
  [Phases.ELABORATION]: ElaborationModel,
  [Phases.NEGOTIATION]: NegotiationModel,
  [Phases.SPECIFICATION]: SpecificationModel,
  [Phases.VALIDATION]: ValidationModel,
  [Phases.MANAGEMENT]: null,
};

const determineNextVersion = async (project, PhaseModel) => {
  const projectId = project._id;

  const existingPhaseDoc = await PhaseModel
    .findOne({ projectId, isDeleted: false })
    .sort({ "version.major": -1 })
    .lean();

  let version;

  if (!existingPhaseDoc?.version) {
    version = { major: 1, minor: 0 };
  } else {
    version = {
      major: existingPhaseDoc.version.major,
      minor: existingPhaseDoc.version.minor + 1
    };
  }

  return {
    version,
    existingPhaseDoc   // ✅ return this
  };
};

const applyVersionUpdate = async ({
  PhaseModel,
  projectId,
  version,
  performedBy,
  existingDoc,
  currentPhase,
  action,
  auditContext
}) => {

  let result;

  if (existingDoc) {
    result = await PhaseModel.findByIdAndUpdate(
      existingDoc._id,
      {
        $set: {
          version,
          updatedBy: performedBy
        }
      },
      { returnDocument: 'after', runValidators: true }
    );
  } else {
    result = await PhaseModel.create({
      projectId,
      version,
      createdBy: performedBy
    });
  }

  // ✅ Tracker AFTER DB operation (for both create & update)
  const { user, device, requestId } = auditContext || {};

  logActivityTrackerEvent(
    user,
    device,
    requestId,
    ACTIVITY_TRACKER_EVENTS.PHASE_VERSION_CHANGE,
    action,
    {
      newData: {
        phase: currentPhase,
        version: `v${version.major}.${version.minor}`
      },
      adminActions: { targetId: projectId?.toString() },
    }
  );

  return result;
};
 
const versionControlService = async (project, action, performedBy, auditContext) => {

  const currentPhase = project.currentPhase;
  const PhaseModel = PHASE_MODEL_MAP[currentPhase];
  if (!PhaseModel) return { success: true };

  const { version: nextVersion, existingPhaseDoc } =
    await determineNextVersion(project, PhaseModel);

  await applyVersionUpdate({
    PhaseModel,
    projectId: project._id,
    version: nextVersion,   // ✅ yahan change
    performedBy,
    existingDoc: existingPhaseDoc,
    currentPhase,
    action,
    auditContext
  });

  logWithTime(`✅ Version updated → v${nextVersion.major}.${nextVersion.minor}`); // ✅ yahan change

  return {
    success: true,
    newVersion: `v${nextVersion.major}.${nextVersion.minor}` // ✅ yahan change
  };
};

const manualVersionControlService = async ({
  projectId,
  currentPhase,
  action,
  performedBy,
  auditContext
}) => {

  const PhaseModel = PHASE_MODEL_MAP[currentPhase];
  if (!PhaseModel) return { success: true };
  
  // fake minimal project object (reuse existing flow)
  const project = { _id: projectId };

  const { version: nextVersion, existingPhaseDoc } =
    await determineNextVersion(project, PhaseModel);

  await applyVersionUpdate({
    PhaseModel,
    projectId,
    version: nextVersion,
    performedBy,
    existingDoc: existingPhaseDoc,
    currentPhase,
    action,
    auditContext
  });

  logWithTime(`✅ Manual Version updated → v${nextVersion.major}.${nextVersion.minor}`);

  return {
    success: true,
    newVersion: `v${nextVersion.major}.${nextVersion.minor}`
  };
};

module.exports = { versionControlService, manualVersionControlService };