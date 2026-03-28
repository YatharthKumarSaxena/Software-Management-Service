// services/elicitations/get-latest-elicitation.service.js

const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Returns the latest elicitation (already fetched and validated by middleware).
 * 
 * The middleware finds the latest by version.major DESC before calling this service.
 * This is a READ operation - NO ACTIVITY TRACKING.
 *
 * @param {Object} elicitation - Latest elicitation document (already fetched by middleware)
 *
 * @returns {Object} { success: true, elicitation }
 */
const getLatestElicitationService = async (elicitation) => {
  try {
    logWithTime(`✅ [getLatestElicitationService] Latest elicitation retrieved: ${elicitation._id}`);
    return {
      success: true,
      elicitation
    };
  } catch (error) {
    logWithTime(`❌ [getLatestElicitationService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { getLatestElicitationService };
