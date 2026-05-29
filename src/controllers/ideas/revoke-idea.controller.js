// controllers/ideas/revoke-idea.controller.js

const { ideaServices } = require("@services/ideas");
const {
  throwBadRequestError,
  throwConflictError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendIdeaRevokedSuccess } = require("@/responses/success/idea.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { BAD_REQUEST, CONFLICT } = require("@configs/http-status.config");

/**
 * PATCH /ideas/:ideaId/revoke
 * Revoke an idea (change status from ACCEPTED to REVOKED).
 * Requires reason type and optional/mandatory reason description.
 * Reason description is MANDATORY if project criticality is HIGH.
 */
const revokeIdeaController = async (req, res) => {
  try {
    const { idea } = req;
    const { revokeReasonType, revokeReasonDescription } = req.body;

    logWithTime(
      `📍 [revokeIdeaController] Revoking idea: ${idea._id} | ${getLogIdentifiers(req)}`
    );

    // ── Step 1: Fetch project to get criticality ──────────────────────
    const project = req.project;

    // ── Step 2: Call service ──────────────────────────────────────────
    const result = await ideaServices.revokeIdeaService(
      idea,
      {
        revokeReasonType,
        revokeReasonDescription,
        revokedBy: req.admin.adminId,
        projectCriticality: project.projectCriticality,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [revokeIdeaController] ${result.message} | ${getLogIdentifiers(req)}`);
      
      if (result.errorCode === BAD_REQUEST) {
        return throwBadRequestError(res, result.message);
      }
      if (result.errorCode === CONFLICT) {
        return throwConflictError(res, result.message);
      }
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [revokeIdeaController] Idea revoked successfully | ${getLogIdentifiers(req)}`);
    return sendIdeaRevokedSuccess(res, result.idea);

  } catch (error) {
    logWithTime(`❌ [revokeIdeaController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwSpecificInternalServerError(res, error);
  }
};

module.exports = { revokeIdeaController };
