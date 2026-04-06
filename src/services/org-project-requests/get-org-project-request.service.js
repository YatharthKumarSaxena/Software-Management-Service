// services/org-project-requests/get-org-project-request.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const StakeholderModel = require("@models/stakeholder.model");
const ProjectModel = require("@models/project.model");
const { NOT_FOUND, FORBIDDEN, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Gets a single org project request with authorization check
 * 
 * Authorization:
 * - Requester must be the client who created the request OR admin/project owner
 * 
 * @param {Object} params
 * @param {Object} params.request - Pre-fetched OrgProjectRequest object
 * @param {string} params.requesterClientId - Client ID of requester
 * @param {string} params.requesterAdminId - Admin ID of requester (if applicable)
 * @returns {{ success: boolean, request?: Object, message?: string, errorCode?: string }}
 */
const getOrgProjectRequestService = async ({
  request,
  requesterClientId = null,
  requesterAdminId = null
}) => {
  try {
    logWithTime(`[getOrgProjectRequestService] Fetching request: ${request._id}`);

    /* ── Authorization Check ──────────────────────────────────────── */
    const isRequesterTheClient = request.clientId.toString() === requesterClientId;
    const isAdmin = !!requesterAdminId;

    if (!isRequesterTheClient && !isAdmin) {
      logWithTime(`❌ [getOrgProjectRequestService] Unauthorized access attempt by client ${requesterClientId}`);
      return { success: false, message: "Unauthorized", errorCode: FORBIDDEN };
    }

    // Mask reason fields based on request status
    const requestObj = request.toObject();
    if (request.status !== 'APPROVED') {
      requestObj.approveReasonType = null;
      requestObj.approveReasonDescription = null;
    }
    if (request.status !== 'REJECTED') {
      requestObj.rejectReasonType = null;
      requestObj.rejectReasonDescription = null;
    }

    return {
      success: true,
      request: requestObj,
      message: "Request retrieved successfully"
    };

  } catch (error) {
    logWithTime(`❌ [getOrgProjectRequestService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to retrieve request",
      error: error.message,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { getOrgProjectRequestService };
