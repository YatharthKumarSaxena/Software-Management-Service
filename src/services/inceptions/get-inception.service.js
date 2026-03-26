// services/inceptions/get-inception.service.js

/**
 * Fetches the latest (highest version.major) inception for a given project.
 *
 * @param {string} projectId - Project MongoDB ObjectId
 *
 * @returns {{ success: true, inception } | { success: false, message }}
 */
const getInceptionService = async (inception) => {
  try {
    return {
      success: true,
      inception: inception
    };
  } catch (error) {
    return {
      success: false,
      message: "Internal error while fetching inception",
      error: error.message
    };
  }
};

module.exports = { getInceptionService };
