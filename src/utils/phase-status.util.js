const { PhaseStatus } = require("@configs/enums.config");
const { getMyEnvAsBool } = require("@utils/env.util");

const getPhaseStatus = (phaseDocument = {}) => {
  return phaseDocument.phaseStatus ?? PhaseStatus.OPEN;
};

const isPhaseFrozen = (phaseDocument = {}) => {
  return getPhaseStatus(phaseDocument) === PhaseStatus.FROZEN;
};

const isPhaseOpenForWork = (phaseDocument = {}) => {
  const status = getPhaseStatus(phaseDocument);
  return (
    status === PhaseStatus.OPEN ||
    status === PhaseStatus.STABILIZING
  );
};

const buildActivePhaseQuery = (projectId) => ({
  projectId,
  isDeleted: false,
  phaseStatus: {
    $in: [PhaseStatus.OPEN, PhaseStatus.STABILIZING]
  }
});

const resolveAllowStabilizingRollback = (project = {}) => {
  if (typeof project.allowStabilizingRollback === "boolean") {
    return project.allowStabilizingRollback;
  }

  return getMyEnvAsBool(
    "DEFAULT_ALLOW_STABILIZING_ROLLBACK",
    false
  );
};

const canTransitionPhaseStatus = ({
  currentStatus,
  nextStatus,
  allowStabilizingRollback
}) => {
  if (currentStatus === nextStatus) {
    return true;
  }

  if (
    currentStatus === PhaseStatus.OPEN &&
    nextStatus === PhaseStatus.STABILIZING
  ) {
    return true;
  }

  if (
    currentStatus === PhaseStatus.STABILIZING &&
    nextStatus === PhaseStatus.OPEN &&
    allowStabilizingRollback
  ) {
    return true;
  }

  if (
    currentStatus === PhaseStatus.STABILIZING &&
    nextStatus === PhaseStatus.FROZEN
  ) {
    return true;
  }

  return false;
};

module.exports = {
  getPhaseStatus,
  isPhaseFrozen,
  isPhaseOpenForWork,
  buildActivePhaseQuery,
  resolveAllowStabilizingRollback,
  canTransitionPhaseStatus
};