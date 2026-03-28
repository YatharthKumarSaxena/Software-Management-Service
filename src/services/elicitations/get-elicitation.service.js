// services/elicitations/get-elicitation.service.js

const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Returns an elicitation (already fetched and validated by middleware).
 * 
 * This is a READ operation - NO ACTIVITY TRACKING.
 *
 * @param {Object} elicitation - Elicitation document (already validated by middleware)
 *
 * @returns {Object} { success: true, elicitation }
 */
const getElicitationService = async (elicitation) => {
  try {
    logWithTime(`✅ [getElicitationService] Elicitation retrieved: ${elicitation._id}`);
    return {
      success: true,
      elicitation
    };
  } catch (error) {
    logWithTime(`❌ [getElicitationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { getElicitationService };
