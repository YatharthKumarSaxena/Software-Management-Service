const { updatePhaseStatus } = require("@services/common/phase-management.service");
const { manualVersionControlService } = require("@services/common/version.service");

/**
 * Coordinates a phase document update and a phase-status transition while
 * keeping phase-specific mutation and auditing in the calling service.
 */
const executePhaseUpdate = async ({
  phaseDocument,
  phase,
  phaseName,
  requestedPhaseStatus,
  phaseStatusChanged,
  documentChanged,
  updatedBy,
  auditContext,
  updateDocument,
  versionAction
}) => {
  const phaseStatusRequested = requestedPhaseStatus !== undefined;

  if (!documentChanged && !phaseStatusRequested) {
    return {
      success: true,
      message: "No changes detected.",
      phaseDocument
    };
  }

  let currentDocument = phaseDocument;
  let transitionOccurred = false;

  if (phaseStatusRequested) {
    const transitionResult = await updatePhaseStatus({
      phaseDocument,
      phase,
      nextStatus: requestedPhaseStatus,
      updatedBy,
      auditContext
    });

    if (!transitionResult.success) {
      return transitionResult;
    }

    transitionOccurred = phaseStatusChanged && !transitionResult.alreadyInRequestedStatus;
    currentDocument = transitionResult.phase;
  }

  if (documentChanged) {
    currentDocument = await updateDocument(currentDocument);
  }

  if (documentChanged || transitionOccurred) {
    const versionResult = await manualVersionControlService({
      projectId: currentDocument.projectId,
      currentPhase: phase,
      action: versionAction,
      performedBy: updatedBy,
      auditContext,
      phaseDocument: currentDocument
    });

    if (!versionResult.success) {
      return versionResult;
    }

    currentDocument = versionResult.phaseDocument;
  }

  let message;
  if (documentChanged && transitionOccurred) {
    message = `${phaseName} updated and phase transitioned successfully.`;
  } else if (documentChanged && phaseStatusRequested) {
    message = `${phaseName} and phase updated successfully.`;
  } else if (documentChanged) {
    message = `${phaseName} updated successfully.`;
  } else if (transitionOccurred) {
    message = "Phase transitioned successfully.";
  } else {
    message = "Phase already in requested status.";
  }

  return {
    success: true,
    message,
    phaseDocument: currentDocument,
    transitionOccurred
  };
};

module.exports = { executePhaseUpdate };
