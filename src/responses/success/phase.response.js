// responses/success/phase-roles.response.js

const { OK, CREATED } = require("@/configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Success response handlers for phase roles operations.
 * Each handler sends response with appropriate HTTP status code.
 */

const createPhaseSuccessResponse = (
  res,
  phaseType,
  phase,
  message
) => {

  return res.status(CREATED).json({
    success: true,
    message:
      message ??
      `${phaseType} created successfully.`,
    data: {
      phase
    }
  });

};

const updatePhaseSettingsSuccessResponse = (
  res,
  phaseType,
  phase,
  message
) => {

  return res.status(OK).json({
    success: true,
    message:
      message ??
      `${phaseType} settings updated successfully.`,
    data: {
      phase
    }
  });

};

const updatePhaseStatusSuccessResponse = (
  res,
  phaseType,
  phase,
  message
) => {

  return res.status(OK).json({
    success: true,
    message:
      message ??
      `${phaseType} status updated successfully.`,
    data: {
      phase
    }
  });

};

const deletePhaseSuccessResponse = (
  res,
  phaseType,
  phase,
  message
) => {

  return res.status(OK).json({
    success: true,
    message:
      message ??
      `Latest Cycle of ${phaseType} phase deleted successfully.`,
    data: {
      phase
    }
  });

};


const fetchPhaseSuccessResponse = (
  res,
  phaseType,
  phase,
  message
) => {

  return res.status(OK).json({
    success: true,
    message:
      message ??
      `${phaseType} fetched successfully.`,
    data: {
      phase
    }
  });

};

const fetchPhasesListSuccessResponse = (
    res,
    phaseType,
    phases,
    pagination,
    message
) => {

    return res.status(OK).json({
        success: true,
        message:
            message ??
            `Found ${pagination.totalCount} ${phaseType}(s)`,
        data: phases,
        pagination
    });
};

const fetchLatestPhaseSuccessResponse = (
  res,
  phaseType,
  phase,
  message
) => {

  return res.status(OK).json({
    success: true,
    message:
      message ??
      `Latest ${phaseType} fetched successfully.`,
    data: {
      phase
    }
  });

};

// ─────────────────────────────────────────────────────────────────────────────
// CONTRIBUTOR RESPONSES
// ─────────────────────────────────────────────────────────────────────────────


const sendContributorAddedSuccess = (res, phase) => {
  logWithTime(`✅ [sendContributorAddedSuccess] Contributor added to phase`);
  return res.status(OK).json({
    success: true,
    message: "Contributor added successfully",
    data: phase
  });
};

const sendContributorRemovedSuccess = (res, phase) => {
  logWithTime(`✅ [sendContributorRemovedSuccess] Contributor removed from phase`);
  return res.status(OK).json({
    success: true,
    message: "Contributor removed successfully",
    data: phase
  });
};

const sendContributorsListSuccess = (res, contributors) => {
  logWithTime(`✅ [sendContributorsListSuccess] Contributors list fetched (count: ${contributors?.length || 0})`);
  return res.status(OK).json({
    success: true,
    message: "Contributors fetched successfully",
    data: contributors
  });
};

const sendContributorFetchSuccess = (res, contributor) => {
  logWithTime(`✅ [sendContributorFetchSuccess] Contributor fetched`);
  return res.status(OK).json({
    success: true,
    message: "Contributor fetched successfully",
    data: contributor
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWER RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

const sendReviewerAddedSuccess = (res, phase) => {
  logWithTime(`✅ [sendReviewerAddedSuccess] Reviewer added to phase`);
  return res.status(OK).json({
    success: true,
    message: "Reviewer added successfully",
    data: phase
  });
};

const sendReviewerRemovedSuccess = (res, phase) => {
  logWithTime(`✅ [sendReviewerRemovedSuccess] Reviewer removed from phase`);
  return res.status(OK).json({
    success: true,
    message: "Reviewer removed successfully",
    data: phase
  });
};

const sendReviewersListSuccess = (res, reviewers) => {
  logWithTime(`✅ [sendReviewersListSuccess] Reviewers list fetched (count: ${reviewers?.length || 0})`);
  return res.status(OK).json({
    success: true,
    message: "Reviewers fetched successfully",
    data: reviewers
  });
};

const sendReviewerFetchSuccess = (res, reviewer) => {
  logWithTime(`✅ [sendReviewerFetchSuccess] Reviewer fetched`);
  return res.status(OK).json({
    success: true,
    message: "Reviewer fetched successfully",
    data: reviewer
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// APPROVER RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

const sendApproverAddedSuccess = (res, phase) => {
  logWithTime(`✅ [sendApproverAddedSuccess] Approver added to phase`);
  return res.status(OK).json({
    success: true,
    message: "Approver added successfully",
    data: phase
  });
};

const sendApproverRemovedSuccess = (res, phase) => {
  logWithTime(`✅ [sendApproverRemovedSuccess] Approver removed from phase`);
  return res.status(OK).json({
    success: true,
    message: "Approver removed successfully",
    data: phase
  });
};

const sendApproversListSuccess = (res, approvers) => {
  logWithTime(`✅ [sendApproversListSuccess] Approvers list fetched (count: ${approvers?.length || 0})`);
  return res.status(OK).json({
    success: true,
    message: "Approvers fetched successfully",
    data: approvers
  });
};

const sendApproverFetchSuccess = (res, approver) => {
  logWithTime(`✅ [sendApproverFetchSuccess] Approver fetched`);
  return res.status(OK).json({
    success: true,
    message: "Approver fetched successfully",
    data: approver
  });
};

module.exports = {
  // CRUD
  createPhaseSuccessResponse,
  updatePhaseSettingsSuccessResponse,
  updatePhaseStatusSuccessResponse,
  deletePhaseSuccessResponse,
  fetchPhaseSuccessResponse,
  fetchPhasesListSuccessResponse,
  fetchLatestPhaseSuccessResponse,

  // Contributor
  sendContributorAddedSuccess,
  sendContributorRemovedSuccess,
  sendContributorsListSuccess,
  sendContributorFetchSuccess,
  // Reviewer
  sendReviewerAddedSuccess,
  sendReviewerRemovedSuccess,
  sendReviewersListSuccess,
  sendReviewerFetchSuccess,
  // Approver
  sendApproverAddedSuccess,
  sendApproverRemovedSuccess,
  sendApproversListSuccess,
  sendApproverFetchSuccess
};
