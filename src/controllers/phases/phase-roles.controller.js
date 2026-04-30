// controllers/phases/phase-roles.controller.js

const { phaseRolesServices } = require("@services/phases");
const {
  throwConflictError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const {
  sendContributorAddedSuccess,
  sendContributorRemovedSuccess,
  sendContributorsListSuccess,
  sendContributorFetchSuccess,
  sendReviewerAddedSuccess,
  sendReviewerRemovedSuccess,
  sendReviewersListSuccess,
  sendReviewerFetchSuccess,
  sendApproverAddedSuccess,
  sendApproverRemovedSuccess,
  sendApproversListSuccess,
  sendApproverFetchSuccess
} = require("@/responses/success/phase-roles.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND } = require("@configs/http-status.config");

// ─────────────────────────────────────────────────────────────────────────────
// CONTRIBUTOR CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

const addContributorController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { adminId } = req.body;
    const { projectId } = req.params;

    logWithTime(
      `📍 [addContributorController] Adding contributor to ${phaseType}: ${adminId} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.addContributorService({
      phaseType,
      phaseId,
      adminId,
      projectId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [addContributorController] Conflict: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message, "Cannot add contributor");
      }
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [addContributorController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Contributor");
      }
      logWithTime(`❌ [addContributorController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [addContributorController] Contributor added successfully | ${getLogIdentifiers(req)}`);
    return sendContributorAddedSuccess(res, result.phase);

  } catch (error) {
    logWithTime(`❌ [addContributorController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const removeContributorController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { adminId } = req.body;
    const { projectId } = req.params;

    logWithTime(
      `📍 [removeContributorController] Removing contributor from ${phaseType}: ${adminId} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.removeContributorService({
      phaseType,
      phaseId,
      adminId,
      projectId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [removeContributorController] Conflict: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message, "Cannot remove contributor");
      }
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [removeContributorController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Contributor");
      }
      logWithTime(`❌ [removeContributorController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [removeContributorController] Contributor removed successfully | ${getLogIdentifiers(req)}`);
    return sendContributorRemovedSuccess(res, result.phase);

  } catch (error) {
    logWithTime(`❌ [removeContributorController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const listContributorsController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { projectId } = req.params;

    logWithTime(
      `📍 [listContributorsController] Listing contributors for ${phaseType} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.listContributorsService({
      phaseType,
      phaseId,
      projectId
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [listContributorsController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Contributors");
      }
      logWithTime(`❌ [listContributorsController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [listContributorsController] Contributors fetched successfully | ${getLogIdentifiers(req)}`);
    return sendContributorsListSuccess(res, result.contributors);

  } catch (error) {
    logWithTime(`❌ [listContributorsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const getContributorController = async (req, res) => {
  try {
    const { phaseType, phaseId, adminId } = req.params;
    const { projectId } = req.params;

    logWithTime(
      `📍 [getContributorController] Fetching contributor ${adminId} for ${phaseType} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.getContributorService({
      phaseType,
      phaseId,
      adminId,
      projectId
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [getContributorController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Contributor");
      }
      logWithTime(`❌ [getContributorController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [getContributorController] Contributor fetched successfully | ${getLogIdentifiers(req)}`);
    return sendContributorFetchSuccess(res, result.contributor);

  } catch (error) {
    logWithTime(`❌ [getContributorController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

const addReviewerController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { adminId } = req.body;
    const { projectId } = req.params;

    logWithTime(
      `📍 [addReviewerController] Adding reviewer to ${phaseType}: ${adminId} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.addReviewerService({
      phaseType,
      phaseId,
      adminId,
      projectId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [addReviewerController] Conflict: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message, "Cannot add reviewer");
      }
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [addReviewerController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Reviewer");
      }
      logWithTime(`❌ [addReviewerController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [addReviewerController] Reviewer added successfully | ${getLogIdentifiers(req)}`);
    return sendReviewerAddedSuccess(res, result.phase);

  } catch (error) {
    logWithTime(`❌ [addReviewerController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const removeReviewerController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { adminId } = req.body;
    const { projectId } = req.params;

    logWithTime(
      `📍 [removeReviewerController] Removing reviewer from ${phaseType}: ${adminId} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.removeReviewerService({
      phaseType,
      phaseId,
      adminId,
      projectId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [removeReviewerController] Conflict: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message, "Cannot remove reviewer");
      }
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [removeReviewerController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Reviewer");
      }
      logWithTime(`❌ [removeReviewerController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [removeReviewerController] Reviewer removed successfully | ${getLogIdentifiers(req)}`);
    return sendReviewerRemovedSuccess(res, result.phase);

  } catch (error) {
    logWithTime(`❌ [removeReviewerController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const listReviewersController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { projectId } = req.params;

    logWithTime(
      `📍 [listReviewersController] Listing reviewers for ${phaseType} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.listReviewersService({
      phaseType,
      phaseId,
      projectId
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [listReviewersController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Reviewers");
      }
      logWithTime(`❌ [listReviewersController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [listReviewersController] Reviewers fetched successfully | ${getLogIdentifiers(req)}`);
    return sendReviewersListSuccess(res, result.reviewers);

  } catch (error) {
    logWithTime(`❌ [listReviewersController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const getReviewerController = async (req, res) => {
  try {
    const { phaseType, phaseId, adminId } = req.params;
    const { projectId } = req.params;

    logWithTime(
      `📍 [getReviewerController] Fetching reviewer ${adminId} for ${phaseType} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.getReviewerService({
      phaseType,
      phaseId,
      adminId,
      projectId
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [getReviewerController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Reviewer");
      }
      logWithTime(`❌ [getReviewerController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [getReviewerController] Reviewer fetched successfully | ${getLogIdentifiers(req)}`);
    return sendReviewerFetchSuccess(res, result.reviewer);

  } catch (error) {
    logWithTime(`❌ [getReviewerController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPROVER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

const addApproverController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { adminId } = req.body;
    const { projectId } = req.params;

    logWithTime(
      `📍 [addApproverController] Adding approver to ${phaseType}: ${adminId} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.addApproverService({
      phaseType,
      phaseId,
      adminId,
      projectId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [addApproverController] Conflict: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message, "Cannot add approver");
      }
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [addApproverController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Approver");
      }
      logWithTime(`❌ [addApproverController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [addApproverController] Approver added successfully | ${getLogIdentifiers(req)}`);
    return sendApproverAddedSuccess(res, result.phase);

  } catch (error) {
    logWithTime(`❌ [addApproverController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const removeApproverController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { adminId } = req.body;
    const { projectId } = req.params;

    logWithTime(
      `📍 [removeApproverController] Removing approver from ${phaseType}: ${adminId} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.removeApproverService({
      phaseType,
      phaseId,
      adminId,
      projectId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    if (!result.success) {
      if (result.errorCode === CONFLICT) {
        logWithTime(`⚠️ [removeApproverController] Conflict: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message, "Cannot remove approver");
      }
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [removeApproverController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Approver");
      }
      logWithTime(`❌ [removeApproverController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [removeApproverController] Approver removed successfully | ${getLogIdentifiers(req)}`);
    return sendApproverRemovedSuccess(res, result.phase);

  } catch (error) {
    logWithTime(`❌ [removeApproverController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const listApproversController = async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { projectId } = req.params;

    logWithTime(
      `📍 [listApproversController] Listing approvers for ${phaseType} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.listApproversService({
      phaseType,
      phaseId,
      projectId
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [listApproversController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Approvers");
      }
      logWithTime(`❌ [listApproversController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [listApproversController] Approvers fetched successfully | ${getLogIdentifiers(req)}`);
    return sendApproversListSuccess(res, result.approvers);

  } catch (error) {
    logWithTime(`❌ [listApproversController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

const getApproverController = async (req, res) => {
  try {
    const { phaseType, phaseId, adminId } = req.params;
    const { projectId } = req.params;

    logWithTime(
      `📍 [getApproverController] Fetching approver ${adminId} for ${phaseType} | ${getLogIdentifiers(req)}`
    );

    const result = await phaseRolesServices.getApproverService({
      phaseType,
      phaseId,
      adminId,
      projectId
    });

    if (!result.success) {
      if (result.errorCode === NOT_FOUND) {
        logWithTime(`❌ [getApproverController] Not found: ${result.message} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Approver");
      }
      logWithTime(`❌ [getApproverController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwInternalServerError(res, new Error(result.message));
    }

    logWithTime(`✅ [getApproverController] Approver fetched successfully | ${getLogIdentifiers(req)}`);
    return sendApproverFetchSuccess(res, result.approver);

  } catch (error) {
    logWithTime(`❌ [getApproverController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  // Contributor
  addContributorController,
  removeContributorController,
  listContributorsController,
  getContributorController,
  // Reviewer
  addReviewerController,
  removeReviewerController,
  listReviewersController,
  getReviewerController,
  // Approver
  addApproverController,
  removeApproverController,
  listApproversController,
  getApproverController
};
