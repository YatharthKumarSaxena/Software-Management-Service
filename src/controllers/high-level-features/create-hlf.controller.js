// controllers/high-level-features/create-hlf.controller.js

const { createHlfService } = require("@services/high-level-features/create-hlf.service");
const { sendHlfCreatedSuccess } = require("@/responses/success/hlf.response");

const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

const createHlfController = async (req, res) => {
  try {
    const { title, description, linkedIdeaId } = req.body;
    const createdBy = req.admin.adminId;

    const inception = req.inception;
    const project = req.project;

    // ── Call service ──────────────────────────────────────
    const result = await createHlfService({
      inception,
      projectId: project._id.toString(),
      title,
      description: description || null,
      linkedIdeaId: linkedIdeaId || null,
      createdBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
        workflowId: req.workflowId
      },
    });

    if (!result.success) {
      if (result.message === "High-level feature with this title already exists in this inception.") {
        logWithTime(`❌ [createHlfController] Duplicate HLF title | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }

      if (result.message === "Idea with the provided ID does not exist or is deleted.") {
        logWithTime(`❌ [createHlfController] Idea not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [createHlfController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [createHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [createHlfController] High-level feature created successfully | ${getLogIdentifiers(req)}`);
    return sendHlfCreatedSuccess(res, result.hlf);

  } catch (error) {
    logWithTime(`❌ [createHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createHlfController };
