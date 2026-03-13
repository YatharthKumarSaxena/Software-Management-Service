// controllers/projects/delete-project.controller.js

const { deleteProjectService } = require("@services/projects/delete-project.service");
const { sendProjectDeletedSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Delete Project (Soft Delete)
 *
 * @route  DELETE /software-management-service/api/v1/admin/delete-project/:projectId
 * @access Private – Admin (CEO only)
 *
 * @params {string} projectId               - MongoDB ObjectId of the project
 * @body   {string} deletionReasonType      - Enum: why the project is being deleted
 * @body   {string} [deletionReasonDescription] - Optional free-text elaboration
 *
 * DELETE IS PERMANENT (one-way soft delete):
 *   – Can only be done once (blocked if isDeleted === true)
 *   – Blocked if projectStatus === COMPLETED
 *   – After deletion: update / abort / complete / resume are all blocked
 *
 * @returns {200} Project deleted successfully (no body data returned)
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const deleteProjectController = async (req, res) => {
  try {

    const project = req.project; // fetchProjectMiddleware ne inject kiya hai

    const { deletionReasonType, deletionReasonDescription } = req.body;
    const deletedBy = req.admin.adminId;

    const result = await deleteProjectService(project, {
      deletionReasonType,
      deletionReasonDescription,
      deletedBy,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (
        result.message === "Project is currently active" ||
        result.message === "Completed projects cannot be deleted"
      ) {
        logWithTime(`❌ [deleteProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.message);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [deleteProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [deleteProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [deleteProjectController] Project deleted successfully | ${getLogIdentifiers(req)}`);
    return sendProjectDeletedSuccess(res);
  } catch (error) {
    logWithTime(`❌ [deleteProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteProjectController };
