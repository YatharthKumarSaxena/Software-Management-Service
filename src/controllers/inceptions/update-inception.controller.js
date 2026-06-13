// controllers/inceptions/update-inception.controller.js

const { inceptionServices } = require("@services/inceptions");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendInceptionUpdatedSuccess } = require("@/responses/success/inception.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { OK } = require("@configs/http-status.config");

/**
 * PUT /projects/:projectId/inceptions/:inceptionId
 * Update an inception's mode.
 */
const updateInceptionController = async (req, res) => {
  try {
    const { allowParallelMeetings, workflowMode, phaseStatus } = req.body;
    const { inception } = req;

    logWithTime(
      `📍 [updateInceptionController] Updating inception: ${inception._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await inceptionServices.updateInceptionService(
      inception,
      {
        allowParallelMeetings: typeof allowParallelMeetings === 'boolean' ? allowParallelMeetings : undefined,
        workflowMode: typeof workflowMode === 'string' ? workflowMode : undefined,
        phaseStatus: typeof phaseStatus === 'string' ? phaseStatus : undefined,
        updatedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [updateInceptionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    if (result.message === "No changes detected") {
        logWithTime(`⚠️ No changes detected for Inception update in project ${inception.projectId}`);
      return res.status(OK).json({
        success: true,
        message: "No changes detected. Inception mode remains unchanged."
      });
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [updateInceptionController] Inception updated successfully | ${getLogIdentifiers(req)}`);
    return sendInceptionUpdatedSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [updateInceptionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateInceptionController };
