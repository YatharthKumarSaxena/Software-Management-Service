// controllers/elicitations/delete-elicitation.controller.js

const { elicitationServices } = require("@services/elicitations");
const {
  throwBadRequestError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { sendElicitationDeletedSuccess } = require("@/responses/success/elicitation.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { PriorityLevels } = require("@configs/enums.config");

/**
 * DELETE /projects/:projectId/elicitations/:elicitationId
 * Delete (soft delete) an elicitation.
 * 
 * If project criticality is HIGH, description is mandatory.
 */
const deleteElicitationController = async (req, res) => {
  try {
    const { deletionReasonType, deletionReasonDescription } = req.body;
    const { elicitation, project, stakeholder, auditContext } = req;

    logWithTime(
      `📍 [deleteElicitationController] Deleting elicitation: ${elicitation._id} | ${getLogIdentifiers(req)}`
    );

    // ── Conditional validation: description mandatory for HIGH criticality ─
    if (project.projectCriticality === PriorityLevels.HIGH) {
      if (!deletionReasonDescription || deletionReasonDescription.trim().length === 0) {
        logWithTime(
          `❌ [deleteElicitationController] Description required for HIGH criticality project | ${getLogIdentifiers(req)}`
        );
        return throwBadRequestError(
          res,
          "Description is mandatory for HIGH criticality projects",
          "When project criticality is HIGH, description field is required"
        );
      }
    }

    // ── Call service ──────────────────────────────────────────────────
    const result = await elicitationServices.deleteElicitationService(
      elicitation,
      {
        deletionReasonType,
        deletionReasonDescription: deletionReasonDescription || null,
        deletedBy: req.admin.adminId,
        auditContext: {
          user: req.admin,
          device: req.device,
          requestId: req.requestId
        }
      }
    );

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [deleteElicitationController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [deleteElicitationController] Elicitation deleted successfully | ${getLogIdentifiers(req)}`);
    return sendElicitationDeletedSuccess(res, result.elicitation);

  } catch (error) {
    logWithTime(`❌ [deleteElicitationController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteElicitationController };
