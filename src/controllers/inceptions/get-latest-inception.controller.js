// controllers/inceptions/get-latest-inception.controller.js

const { getLatestInceptionService } = require("@/services/inceptions/get-latest-inception.service");
const { sendLatestInceptionFetchedSuccess } = require("@/responses/success/inception.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Get Latest Inception Cycle for a Project
 *
 * @route  GET /software-management-service/api/v1/inceptions/get/:projectId
 * @access Private – All admin roles
 *
 * Fetches the latest (most recent) inception cycle for a given project.
 *
 * @returns {200} Latest inception details
 * @returns {400} Invalid projectId
 * @returns {404} No inception found
 * @returns {500} Internal server error
 */
const getLatestInceptionController = async (req, res) => {
  try {
    const inception = req.inception; // From fetchLatestInceptionMiddleware

    logWithTime(
      `📍 [getLatestInceptionController] Fetching latest inception for project | ${getLogIdentifiers(req)}`
    );

    // Call service
    const result = await getLatestInceptionService(inception);

    if (!result.success) {
      logWithTime(`❌ [getLatestInceptionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, "Inception");
    }

    logWithTime(`✅ [getLatestInceptionController] Latest inception fetched successfully | ${getLogIdentifiers(req)}`);
    return sendLatestInceptionFetchedSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [getLatestInceptionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getLatestInceptionController };
