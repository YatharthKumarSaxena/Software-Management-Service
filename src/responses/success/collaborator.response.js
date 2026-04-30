// responses/success/collaborator.response.js

const { OK } = require("@/configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Success response handlers for collaborator operations on requirements.
 * Each handler sends response with appropriate HTTP status code.
 */

// ── FETCH SINGLE COLLABORATOR ──────────────────────────────────────
const sendCollaboratorFetchSuccess = (res, collaborator) => {
  logWithTime(`✅ [sendCollaboratorFetchSuccess] Collaborator fetched ID: ${collaborator._id}`);
  return res.status(OK).json({
    success: true,
    message: "Collaborator fetched successfully",
    data: {
      collaborator
    }
  });
};

// ── LIST COLLABORATORS ─────────────────────────────────────────────
const sendCollaboratorListSuccess = (res, collaborators, metadata) => {
  logWithTime(`✅ [sendCollaboratorListSuccess] Listed ${collaborators.length} collaborators`);
  return res.status(OK).json({
    success: true,
    message: "Collaborators listed successfully",
    data: {
      collaborators,
      metadata: metadata || {}
    }
  });
};

module.exports = {
  sendCollaboratorFetchSuccess,
  sendCollaboratorListSuccess
};
