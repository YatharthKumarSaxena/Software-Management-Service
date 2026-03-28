// controllers/inceptions/delete-inception.controller.js

const { deleteInceptionService } = require("@services/inceptions/delete-inception.service");
const { sendInceptionDeletedSuccess } = require("@/responses/success/inception.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
  throwBadRequestError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Delete Latest Inception for a Project
 *
 * @route  DELETE /software-management-service/api/v1/inceptions/delete/:projectId
 * @access Private – CEO only
 *
 * Soft-deletes the latest (most recent) inception for a project.
 * Prevents deletion if the associated project type is DEVELOPMENT.
 *
 * Expects:
 *   - req.project: Fetched by fetchProjectMiddleware
 *   - req.inception: Latest inception (fetched by fetchLatestInceptionMiddleware)
 *   - req.body: { deletionReasonType, deletionReasonDescription }
 *
 * @returns {200} Inception deleted successfully
 * @returns {400} Invalid projectId or validation failed
 * @returns {403} Project Development type - deletion not allowed
 * @returns {404} Project or inception not found
 * @returns {500} Internal server error
 */
const deleteInceptionController = async (req, res) => {
  try {
    const { adminId } = req.admin;
    const { project } = req; // From fetchProjectMiddleware
    const inception = req.inception; // From fetchLatestInceptionMiddleware
    const { deletionReasonType, deletionReasonDescription } = req.body;

    logWithTime(
      `📍 [deleteInceptionController] Deleting latest inception for project: ${project._id} | ${getLogIdentifiers(req)}`
    );

    // Call service with deletion logic and Project Development guard
    const result = await deleteInceptionService(inception, {
      project,
      deletedBy: adminId,
      deletionReasonType,
      deletionReasonDescription,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.message === "Inception cannot be deleted for Project Development type.") {
        logWithTime(`⚠️ [deleteInceptionController] Deletion blocked due to project type: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }
      if (result.message === "Inception cannot be deleted for projects that are not in ACTIVE or DRAFT status.") {
        logWithTime(`⚠️ [deleteInceptionController] Deletion blocked due to project status: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }
      if (result.message === "Inception cannot be deleted for high-criticality projects without a reason description.") {
        logWithTime(`⚠️ [deleteInceptionController] Deletion blocked due to missing reason for critical project: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }
      logWithTime(`⚠️ [deleteInceptionController] Deletion blocked: ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [deleteInceptionController] Inception deleted successfully | ${getLogIdentifiers(req)}`);
    return sendInceptionDeletedSuccess(res);

  } catch (error) {
    logWithTime(`❌ [deleteInceptionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteInceptionController };
