// services/elicitations/list-elicitations.service.js

const { ElicitationModel } = require("@models/elicitation.model");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Lists all non-deleted elicitations for a project.
 * 
 * This is a READ operation - NO ACTIVITY TRACKING.
 *
 * @param {string} projectId - Project ID
 *
 * @returns {Object} { success: true, elicitations } | { success: false, message }
 */
const listElicitationsService = async (projectId) => {
  try {
    // ── Query all non-deleted elicitations for project ────────────────
    const elicitations = await ElicitationModel.find({
      projectId,
      isDeleted: false
    }).lean();

    logWithTime(
      `✅ [listElicitationsService] Retrieved ${elicitations.length} elicitations from project ${projectId}`
    );
    return {
      success: true,
      elicitations
    };
  } catch (error) {
    logWithTime(`❌ [listElicitationsService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { listElicitationsService };
