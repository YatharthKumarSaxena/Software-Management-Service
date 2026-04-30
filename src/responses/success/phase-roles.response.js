// responses/success/phase-roles.response.js

const { OK } = require("@/configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Success response handlers for phase roles operations.
 * Each handler sends response with appropriate HTTP status code.
 */

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
