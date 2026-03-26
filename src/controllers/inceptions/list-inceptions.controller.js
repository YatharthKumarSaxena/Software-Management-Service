// controllers/inceptions/list-inceptions.controller.js

const { listInceptionsService } = require("@services/inceptions/list-inceptions.service");
const { sendInceptionsListFetchedSuccess } = require("@/responses/success/inception.response");
const {
  throwSpecificInternalServerError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: List All Inceptions for a Project
 *
 * @route  GET /software-management-service/api/v1/inceptions/list/:projectId
 * @access Private – All admin roles
 *
 * Fetches all inception cycles for a given project, sorted by version.major in descending order.
 *
 * @returns {200} Array of inceptions with count
 * @returns {400} Invalid projectId
 * @returns {500} Internal server error
 */
const listInceptionsController = async (req, res) => {
  try {
    const project = req.project; // From fetchProjectMiddleware
    const projectId = project._id;

    // Call service
    const result = await listInceptionsService(projectId);

    if (!result.success) {
      logWithTime(`❌ [listInceptionsController] Error: ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [listInceptionsController] All inceptions fetched successfully for projectId: ${projectId} | ${getLogIdentifiers(req)}`);
    return sendInceptionsListFetchedSuccess(res, result.inceptions, result.total);

  } catch (error) {
    logWithTime(`❌ [listInceptionsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listInceptionsController };
