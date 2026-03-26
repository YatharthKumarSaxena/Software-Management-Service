// services/inceptions/list-inceptions.service.js

const { InceptionModel } = require("@models/inception.model");

/**
 * Fetches all non-deleted inceptions for a given project, sorted by version.major descending.
 *
 * @param {string} projectId - Project MongoDB ObjectId
 *
 * @returns {{ success: true, inceptions, total } | { success: false, message }}
 */
const listInceptionsService = async (projectId) => {
  try {
    const inceptions = await InceptionModel
      .find({
        projectId,
        isDeleted: false
      })
      .sort({ "version.major": -1 })
      .lean();

    return {
      success: true,
      inceptions,
      total: inceptions.length
    };
  } catch (error) {
    return {
      success: false,
      message: "Internal error while fetching inceptions",
      error: error.message
    };
  }
};

module.exports = { listInceptionsService };
