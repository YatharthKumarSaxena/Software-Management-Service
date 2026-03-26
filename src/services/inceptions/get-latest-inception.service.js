// services/inceptions/get-latest-inception.service.js

const { InceptionModel } = require("@models/inception.model");

/**
 * Fetches the latest (highest version.major) inception for a given project.
 *
 * @param {string} projectId - Project MongoDB ObjectId
 *
 * @returns {{ success: true, inception } | { success: false, message }}
 */
const getLatestInceptionService = async (projectId) => {
  try {
    const latestInception = await InceptionModel
      .findOne({
        projectId,
        isDeleted: false
      })
      .sort({ "version.major": -1 })
      .lean();

    if (!latestInception) {
      return {
        success: false,
        message: "No inception found for this project."
      };
    }

    return {
      success: true,
      inception: latestInception
    };
  } catch (error) {
    return {
      success: false,
      message: "Internal error while fetching inception",
      error: error.message
    };
  }
};

module.exports = { getLatestInceptionService };
