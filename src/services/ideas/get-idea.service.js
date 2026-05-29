// services/ideas/get-idea.service.js

const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Retrieves a single idea document.
 * The idea should already be fetched and validated by middleware.
 *
 * @param {Object} idea - Idea document (already fetched and validated)
 *
 * @returns {Object} { success: true, idea } | { success: false, message }
 */
const getIdeaService = async (idea) => {
  try {
    if (!idea) {
      logWithTime(`❌ [getIdeaService] Idea not found or is deleted`);
      return {
        success: false,
        message: "Idea not found or is deleted"
      };
    }

    logWithTime(`✅ [getIdeaService] Idea retrieved successfully: ${idea._id}`);
    
    return {
      success: true,
      idea: idea.toObject ? idea.toObject() : idea
    };

  } catch (error) {
    logWithTime(`❌ [getIdeaService] Error: ${error.message}`);
    return {
      success: false,
      message: "Internal error while retrieving idea",
      error: error.message
    };
  }
};

module.exports = { getIdeaService };
