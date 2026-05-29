// controllers/high-level-features/update-hlf.controller.js

const { updateHlfService } = require("@services/high-level-features/update-hlf.service");
const { sendHlfUpdatedSuccess } = require("@/responses/success/hlf.response");

const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
  throwConflictError,
  throwDBResourceNotFoundError
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");
const { OK } = require("@/configs/http-status.config");

const updateHlfController = async (req, res) => {
  try {
    const { title, description, linkedIdeaId } = req.body;
    const updatedBy = req.admin.adminId;

    const hlf = req.hlf;
    const inception = req.inception;
    const project = req.project;

    // ── Call service ──────────────────────────────────────
    const result = await updateHlfService({
      hlf,
      inception,
      project,
      title: title || null,
      description: description || null,
      linkedIdeaId: linkedIdeaId || null,
      updatedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "High-level feature with this title already exists in this inception.") {
        logWithTime(`❌ [updateHlfController] Duplicate HLF title | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }
      if (result.message === "Idea with the provided ID does not exist or is deleted.") {
        logWithTime(`❌ [updateHlfController] Idea not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [updateHlfController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [updateHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Handle success with "No changes detected" message ──────────────
    if (result.message === "No changes detected") {
      logWithTime(`ℹ️ [updateHlfController] No changes detected | ${getLogIdentifiers(req)}`);
      return res.status(OK).json({
        success: true,
        message: "No changes detected. High-level feature remains unchanged.",
        hlf: result.hlf
      });
    }

    logWithTime(`✅ [updateHlfController] High-level feature updated successfully | ${getLogIdentifiers(req)}`);
    return sendHlfUpdatedSuccess(res, result.hlf);

  } catch (error) {
    logWithTime(`❌ [updateHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateHlfController };
