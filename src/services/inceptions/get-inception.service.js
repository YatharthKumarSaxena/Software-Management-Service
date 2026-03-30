// services/inceptions/get-inception.service.js

const { INTERNAL_ERROR } = require("@/configs/http-status.config");
const { errorMessage } = require("@/utils/log-error.util");

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
    errorMessage(error);
    return {
      success: false,
      message: "Internal error while fetching inception",
      error: INTERNAL_ERROR
    };
  }
};

module.exports = { getInceptionService };
