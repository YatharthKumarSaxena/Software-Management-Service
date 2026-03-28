// services/inceptions/get-latest-inception.service.js

/**
 * Returns the latest inception that was already fetched by middleware.
 *
 * @param {Object} inception - Latest inception document (fetched by fetchLatestInceptionMiddleware)
 *
 * @returns {{ success: true, inception }}
 */
const getLatestInceptionService = async (inception) => {
  try {
    if (!inception) {
      return {
        success: false,
        message: "No inception found"
      };
    }

    return {
      success: true,
      inception
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
