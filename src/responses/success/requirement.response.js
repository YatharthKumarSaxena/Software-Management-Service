// responses/success/requirement.response.js

const { CREATED, OK } = require("@/configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Success response handlers for requirement operations.
 * Each handler sends response with appropriate HTTP status code.
 */

// ── CREATE ─────────────────────────────────────────────────────────
const sendRequirementCreatedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementCreatedSuccess] Requirement created ID: ${requirement._id}`);
  return res.status(CREATED).json({
    success: true,
    message: "Requirement created successfully",
    data: {
      requirement
    }
  });
};

// ── UPDATE ─────────────────────────────────────────────────────────
const sendRequirementUpdatedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementUpdatedSuccess] Requirement updated ID: ${requirement._id}`);
  return res.status(OK).json({
    success: true,
    message: "Requirement updated successfully",
    data: {
      requirement
    }
  });
};

// ── DELETE ─────────────────────────────────────────────────────────
const sendRequirementDeletedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementDeletedSuccess] Requirement deleted ID: ${requirement._id}`);
  return res.status(OK).json({
    success: true,
    message: "Requirement deleted successfully",
    data: {
      requirement
    }
  });
};

// ── FETCH ──────────────────────────────────────────────────────────
const sendRequirementFetchSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementFetchSuccess] Requirement fetched ID: ${requirement._id}`);
  return res.status(OK).json({
    success: true,
    message: "Requirement fetched successfully",
    data: {
      requirement
    }
  });
};

// ── LIST ───────────────────────────────────────────────────────────
const sendRequirementsListSuccess = (res, requirements, pagination) => {
  logWithTime(`✅ [sendRequirementsListSuccess] Listed ${requirements.length} requirements`);
  return res.status(OK).json({
    success: true,
    message: "Requirements listed successfully",
    data: {
      requirements,
      pagination
    }
  });
};

// ── STATE TRANSITIONS ──────────────────────────────────────────────

const sendRequirementTransitionedSuccess = (res, requirement, transition) => {
  logWithTime(`✅ [sendRequirementTransitionedSuccess] Requirement transitioned to ${transition}`);
  return res.status(OK).json({
    success: true,
    message: `Requirement moved to ${transition} successfully`,
    data: {
      requirement
    }
  });
};

const sendRequirementIssuedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementIssuedSuccess] Requirement marked as ISSUED`);
  return res.status(OK).json({
    success: true,
    message: "Requirement marked as ISSUED successfully",
    data: {
      requirement
    }
  });
};

const sendRequirementAcceptedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementAcceptedSuccess] Requirement accepted`);
  return res.status(OK).json({
    success: true,
    message: "Requirement accepted successfully",
    data: {
      requirement
    }
  });
};

const sendRequirementRejectedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementRejectedSuccess] Requirement rejected`);
  return res.status(OK).json({
    success: true,
    message: "Requirement rejected successfully",
    data: {
      requirement
    }
  });
};

const sendRequirementRevertedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementRevertedSuccess] Requirement reverted to DRAFT`);
  return res.status(OK).json({
    success: true,
    message: "Requirement reverted to DRAFT successfully",
    data: {
      requirement
    }
  });
};

const sendRequirementRevokedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementRevokedSuccess] Requirement revoked`);
  return res.status(OK).json({
    success: true,
    message: "Requirement revoked successfully",
    data: {
      requirement
    }
  });
};

// ── FEATURE MAPPING ────────────────────────────────────────────────

const sendRequirementFeatureMappedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementFeatureMappedSuccess] Requirement mapped to feature`);
  return res.status(OK).json({
    success: true,
    message: "Requirement mapped to feature successfully",
    data: {
      requirement
    }
  });
};

const sendRequirementFeatureUnmappedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementFeatureUnmappedSuccess] Requirement unmapped from feature`);
  return res.status(OK).json({
    success: true,
    message: "Requirement unmapped from feature successfully",
    data: {
      requirement
    }
  });
};

// ── REQUIREMENT LINKING ────────────────────────────────────────────

const sendRequirementLinkedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementLinkedSuccess] Requirement linked successfully`);
  return res.status(OK).json({
    success: true,
    message: "Requirement linked successfully",
    data: {
      requirement
    }
  });
};

// ── ASSIGNMENT ─────────────────────────────────────────────────────

const sendRequirementAssignedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementAssignedSuccess] Requirement assigned successfully`);
  return res.status(OK).json({
    success: true,
    message: "Requirement assigned successfully",
    data: {
      requirement
    }
  });
};

// ── UNASSIGNMENT ───────────────────────────────────────────────

const sendRequirementUnassignedSuccess = (res, requirement) => {
  logWithTime(`✅ [sendRequirementUnassignedSuccess] Requirement unassigned successfully`);
  return res.status(OK).json({
    success: true,
    message: "Requirement unassigned successfully",
    data: {
      requirement
    }
  });
};

module.exports = {
  sendRequirementCreatedSuccess,
  sendRequirementUpdatedSuccess,
  sendRequirementDeletedSuccess,
  sendRequirementFetchSuccess,
  sendRequirementsListSuccess,
  sendRequirementTransitionedSuccess,
  sendRequirementIssuedSuccess,
  sendRequirementAcceptedSuccess,
  sendRequirementRejectedSuccess,
  sendRequirementRevertedSuccess,
  sendRequirementRevokedSuccess,
  sendRequirementFeatureMappedSuccess,
  sendRequirementFeatureUnmappedSuccess,
  sendRequirementLinkedSuccess,
  sendRequirementAssignedSuccess,
  sendRequirementUnassignedSuccess
};

