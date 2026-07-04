// controllers/high-level-features/delete-hlf.controller.js

const { deleteHlfService } = require("@services/high-level-features/delete-hlf.service");
const { sendHlfDeletedSuccess } = require("@/responses/success/hlf.response");

const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { PriorityLevels } = require("@/configs/enums.config");

const deleteHlfController = async (req, res) => {
  try {
    const { deletionReasonDescription } = req.body;
    const deletedBy = req.admin.adminId;

    const hlf = req.hlf;
    const inception = req.inception;
    const project = req.project;

    // ── Check if deletion reason is required based on project criticality ─────
    if (project.projectCriticality === PriorityLevels.HIGH && !deletionReasonDescription) {
      logWithTime(`❌ [deleteHlfController] Missing deletion reason for HIGH criticality project | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(
        res,
        "Deletion reason is required",
        "This project has HIGH criticality. Deletion reason description is mandatory."
      );
    }

    // ── Call service ──────────────────────────────────────
    const result = await deleteHlfService({
      hlf,
      inception,
      project,
      deletionReasonDescription: deletionReasonDescription || null,
      deletedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
        workflowId: req.workflowId
      },
    });

    if (!result.success) {
      if (result.message === "Validation error") {
        logWithTime(`❌ [deleteHlfController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [deleteHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [deleteHlfController] High-level feature deleted successfully | ${getLogIdentifiers(req)}`);
    return sendHlfDeletedSuccess(res);

  } catch (error) {
    logWithTime(`❌ [deleteHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteHlfController };
