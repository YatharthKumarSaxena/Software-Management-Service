// utils/requirement-permissions.util.js

const { WorkflowModes } = require("@/configs/enums.config");

/**
 * Permission matrix for requirement operations.
 * Defines which roles can perform which operations based on workflow mode.
 */
const REQUIREMENT_PERMISSIONS = {
  CREATE: {
    [WorkflowModes.MODERATION]: ["contributor", "reviewer", "approver"],
    [WorkflowModes.OPEN]: ["contributor", "reviewer", "approver"]
  },
  UPDATE: {
    [WorkflowModes.MODERATION]: ["creator", "editor", "approver"],
    [WorkflowModes.OPEN]: ["contributor", "reviewer", "approver"]
  },
  DELETE: {
    [WorkflowModes.MODERATION]: ["approver"],
    [WorkflowModes.OPEN]: ["approver"]
  },
  TRANSITION_TO_REVIEW: {
    [WorkflowModes.MODERATION]: ["reviewer", "approver"],
    [WorkflowModes.OPEN]: [] // Not used
  },
  ISSUE: {
    [WorkflowModes.MODERATION]: ["approver"],
    [WorkflowModes.OPEN]: ["approver"]
  },
  ACCEPT: {
    [WorkflowModes.MODERATION]: ["approver"],
    [WorkflowModes.OPEN]: ["approver"]
  },
  REJECT: {
    [WorkflowModes.MODERATION]: ["approver"],
    [WorkflowModes.OPEN]: ["approver"]
  },
  REVERT_TO_DRAFT: {
    [WorkflowModes.MODERATION]: ["creator", "editor", "approver"],
    [WorkflowModes.OPEN]: ["contributor", "reviewer", "approver"]
  },
  MAP_FEATURE: {
    [WorkflowModes.MODERATION]: ["contributor", "reviewer", "approver"],
    [WorkflowModes.OPEN]: ["contributor", "reviewer", "approver"]
  }
};

/**
 * Get allowed roles for an operation (includes aliases for different role names).
 *
 * @param {string} operation - Operation type
 * @param {string} workflowMode - Workflow mode
 * @returns {Array<string>} - Array of allowed role types
 */
const getAllowedRoles = (operation, workflowMode) => {
  return REQUIREMENT_PERMISSIONS[operation]?.[workflowMode] || [];
};

/**
 * Check if a role is allowed for an operation.
 *
 * @param {string} role - Role type
 * @param {string} operation - Operation type
 * @param {string} workflowMode - Workflow mode
 * @returns {boolean} - True if role is allowed
 */
const isRoleAllowed = (role, operation, workflowMode) => {
  const allowedRoles = getAllowedRoles(operation, workflowMode);
  return allowedRoles.includes(role);
};

/**
 * Get readable permission descriptions for UI.
 *
 * @param {string} operation - Operation type
 * @param {string} workflowMode - Workflow mode
 * @returns {string} - Human-readable permission description
 */
const getPermissionText = (operation, workflowMode) => {
  const texts = {
    CREATE: `Only project stakeholders can create requirements`,
    UPDATE: workflowMode === WorkflowModes.MODERATION
      ? `Only creator, assigned editors, or approver can edit`
      : `Only admin stakeholders can edit`,
    DELETE: `Only approver can delete requirements`,
    TRANSITION_TO_REVIEW: `Only reviewer or approver can transition to review`,
    ISSUE: `Only approver can mark as issued`,
    ACCEPT: `Only approver can accept`,
    REJECT: `Only approver can reject`,
    REVERT_TO_DRAFT: `Only authorized users can revert to draft`,
    MAP_FEATURE: `Only admin stakeholders can map features`
  };

  return texts[operation] || "Permission denied";
};

module.exports = {
  REQUIREMENT_PERMISSIONS,
  getAllowedRoles,
  isRoleAllowed,
  getPermissionText
};
