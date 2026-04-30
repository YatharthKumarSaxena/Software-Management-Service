// services/requirements/list-collaborators.service.js

const { RequirementModel } = require("@models/requirement.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * List collaborators of a requirement.
 * Admins see all collaborator info.
 * Clients see limited info (id, name only).
 */
const listCollaboratorsService = async ({ requirementId, isAdmin = true }) => {
  try {
    const requirement = await RequirementModel.findOne({ _id: requirementId, isDeleted: false });
    if (!requirement) {
      return { success: false, message: "Requirement not found", errorCode: NOT_FOUND };
    }

    if (!requirement.collaborators || requirement.collaborators.length === 0) {
      return { success: true, collaborators: [] };
    }

    // ── Fetch stakeholder details for all collaborators ────────────────────
    const collaborators = await StakeholderModel.find(
      { userId: { $in: requirement.collaborators }, isDeleted: false },
      isAdmin 
        ? null // Return all fields for admin
        : "userId name" // Return limited fields for client
    );

    return { success: true, collaborators };
  } catch (error) {
    logWithTime(`❌ [listCollaboratorsService] Error: ${error.message}`);
    return { success: false, message: "Error fetching collaborators", errorCode: INTERNAL_ERROR };
  }
};

module.exports = { listCollaboratorsService };
