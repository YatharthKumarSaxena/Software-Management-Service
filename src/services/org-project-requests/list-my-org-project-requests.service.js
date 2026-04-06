// services/org-project-requests/list-my-org-project-requests.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Lists all org project requests for the authenticated client
 * 
 * @param {Object} params
 * @param {string} params.clientId - Client ID
 * @param {string} params.status - Filter by status (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Results per page (default: 10)
 * @returns {{ success: boolean, requests?: Object[], total?: number, page?: number, limit?: number, message?: string }}
 */
const listMyOrgProjectRequestsService = async ({
  clientId,
  status = null,
  page = 1,
  limit = 10
}) => {
  try {
    logWithTime(`[listMyOrgProjectRequestsService] Listing requests for client: ${clientId}`);

    const filter = {
      clientId: clientId,
      isDeleted: false
    };

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const requests = await OrgProjectRequest.find(filter)
      .populate('projectId', '_id name projectStatus ownerId')
      .populate('clientId', '_id clientId firstName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await OrgProjectRequest.countDocuments(filter);

    // Mask reason fields
    const requestsWithMasking = requests.map(req => {
      const reqObj = req.toObject();
      if (req.status !== 'APPROVED') {
        reqObj.approveReasonType = null;
        reqObj.approveReasonDescription = null;
      }
      if (req.status !== 'REJECTED') {
        reqObj.rejectReasonType = null;
        reqObj.rejectReasonDescription = null;
      }
      return reqObj;
    });

    return {
      success: true,
      requests: requestsWithMasking,
      total,
      page,
      limit,
      message: "Requests retrieved successfully"
    };

  } catch (error) {
    logWithTime(`❌ [listMyOrgProjectRequestsService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to list requests",
      error: error.message,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { listMyOrgProjectRequestsService };
