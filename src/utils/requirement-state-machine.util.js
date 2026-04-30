// utils/requirement-state-machine.util.js

const { RequirementStates, WorkflowModes } = require("@/configs/enums.config");

/**
 * Get valid transitions from current state based on workflow mode.
 * Returns array of allowed next states.
 *
 * @param {string} currentState - Current requirement state
 * @param {string} workflowMode - Workflow mode (MODERATION or OPEN)
 * @param {boolean} isNegotiationActive - Whether Negotiation phase is active
 * @returns {Array<string>} - Array of allowed next states
 */
const getValidTransitions = (currentState, workflowMode, isNegotiationActive = false) => {
  const transitions = {
    [WorkflowModes.MODERATION]: {
      [RequirementStates.DRAFT]: [RequirementStates.UNDER_REVIEW],
      [RequirementStates.UNDER_REVIEW]: [RequirementStates.ACCEPTED, RequirementStates.REJECTED, RequirementStates.ISSUED],
      [RequirementStates.ISSUED]: isNegotiationActive ? [RequirementStates.DRAFT] : [],
      [RequirementStates.ACCEPTED]: [RequirementStates.ISSUED],
      [RequirementStates.REJECTED]: []
    },
    [WorkflowModes.OPEN]: {
      [RequirementStates.DRAFT]: [RequirementStates.ACCEPTED, RequirementStates.REJECTED, RequirementStates.ISSUED],
      [RequirementStates.ISSUED]: [RequirementStates.DRAFT],
      [RequirementStates.ACCEPTED]: [RequirementStates.ISSUED],
      [RequirementStates.REJECTED]: [],
      [RequirementStates.UNDER_REVIEW]: [] // Not used in Open mode
    }
  };

  return transitions[workflowMode]?.[currentState] || [];
};

/**
 * Check if transition is valid.
 *
 * @param {string} currentState - Current state
 * @param {string} nextState - Desired next state
 * @param {string} workflowMode - Workflow mode
 * @param {boolean} isNegotiationActive - Whether Negotiation phase is active
 * @returns {boolean} - True if transition is valid
 */
const canTransition = (currentState, nextState, workflowMode, isNegotiationActive = false) => {
  const validStates = getValidTransitions(currentState, workflowMode, isNegotiationActive);
  return validStates.includes(nextState);
};

/**
 * Get UI metadata for a state (label, color, editable, etc.)
 *
 * @param {string} state - Requirement state
 * @returns {Object} - UI metadata
 */
const getStateMetadata = (state) => {
  const metadata = {
    [RequirementStates.DRAFT]: {
      label: "Draft",
      color: "#FFA500",
      editable: true,
      description: "Requirement is in draft state, can be edited"
    },
    [RequirementStates.UNDER_REVIEW]: {
      label: "Under Review",
      color: "#0099FF",
      editable: false,
      description: "Requirement is under review, awaiting approval"
    },
    [RequirementStates.ISSUED]: {
      label: "Issued",
      color: "#FF6B6B",
      editable: false,
      description: "Requirement has issues, needs discussion and refinement"
    },
    [RequirementStates.ACCEPTED]: {
      label: "Accepted",
      color: "#51CF66",
      editable: false,
      description: "Requirement is accepted and approved"
    },
    [RequirementStates.REJECTED]: {
      label: "Rejected",
      color: "#868E96",
      editable: false,
      description: "Requirement has been rejected, no further action possible"
    }
  };

  return metadata[state] || { label: state, color: "#999", editable: false };
};

module.exports = {
  getValidTransitions,
  canTransition,
  getStateMetadata
};
