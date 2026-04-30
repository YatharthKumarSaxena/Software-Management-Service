// services/requirements/get-collaborator.service.js

const { RequirementModel } = require("@models/requirement.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR, CONFLICT } = require("@configs/http-status.config");

/**
 * Get a single collaborator of a requirement.
 * Admins see all collaborator info.
 * Clients see limited info (id, name only).
 */
const getCollaboratorService = async ({ requirementId, userId, isAdmin = true }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });
    if (!requirement) {
      return { success: false, message: "Requirement not found", errorCode: NOT_FOUND };
    }

    // ── Check if user is a collaborator ───────────────────────────────────
    if (!requirement.collaborators || !requirement.collaborators.includes(userId)) {
      return { success: false, message: "User is not a collaborator on this requirement", errorCode: CONFLICT };
    }

    // ── Fetch stakeholder details ────────────────────────────────────────
    const collaborator = await StakeholderModel.findOne(
      { userId: userId, isDeleted: false },
      isAdmin 
        ? null // Return all fields for admin
        : "userId name" // Return limited fields for client
    );

    if (!collaborator) {
      return { success: false, message: "Collaborator not found", errorCode: NOT_FOUND };
    }

    return { success: true, collaborator };
  } catch (error) {
    logWithTime(`❌ [getCollaboratorService] Error: ${error.message}`);
    return { success: false, message: "Error fetching collaborator", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { getCollaboratorService };
