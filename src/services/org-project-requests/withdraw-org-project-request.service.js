// services/org-project-requests/withdraw-org-project-request.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { RequestStatus } = require("@configs/enums.config");
const { NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR, FORBIDDEN } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Withdraws an org project request (client only, only when PENDING)
 * 
 * @param {Object} params
 * @param {Object} params.request - Pre-fetched OrgProjectRequest object
 * @param {string} params.clientId - Client ID (the requester)
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 * @returns {{ success: boolean, request?: Object, message?: string, errorCode?: string }}
 */
const withdrawOrgProjectRequestService = async ({
  request,
  clientId,
  auditContext
}) => {
  try {
    logWithTime(`[withdrawOrgProjectRequestService] Withdrawing request: ${request._id}`);

    /* ── Validation: Requester is the client who created the request ─── */
    if (request.clientId.toString() !== clientId.toString()) {
      logWithTime(`❌ [withdrawOrgProjectRequestService] Unauthorized - client ${clientId} is not the request creator`);
      return { success: false, message: "Unauthorized", errorCode: FORBIDDEN };
    }

    /* ── Validation: Request must be PENDING ──────────────────────────── */
    if (request.status !== RequestStatus.PENDING) {
      logWithTime(`❌ [withdrawOrgProjectRequestService] Request status is ${request.status}, must be PENDING`);
      return { success: false, message: `Can only withdraw PENDING requests. Current status: ${request.status}`, errorCode: BAD_REQUEST };
    }

    /* ── Capture old data for audit ────────────────────────────────── */
    const oldData = { ...request.toObject ? request.toObject() : request };

    /* ── Update request ──────────────────────────────────────────────── */
    request.status = RequestStatus.WITHDRAWN;
    request.withdrawnAt = new Date();

    const updatedRequest = await request.save();
    logWithTime(`✅ [withdrawOrgProjectRequestService] Request withdrawn: ${request._id}`);

    /* ── Log activity tracker event ──────────────────────────────── */
    try {
      const { user, device, requestId: auditRequestId } = auditContext || {};
      const { oldData: auditOldData, newData: auditNewData } = prepareAuditData(oldData, updatedRequest);

      logActivityTrackerEvent(
        user,
        device,
        auditRequestId,
        ACTIVITY_TRACKER_EVENTS.WITHDRAW_ORG_PROJECT_REQUEST,
        "Organization project request withdrawn by client",
        { oldData: auditOldData, newData: auditNewData, adminActions: { targetId: request._id } }
      );
    } catch (trackerError) {
      logWithTime(`⚠️  [withdrawOrgProjectRequestService] Activity tracker logging failed: ${trackerError.message}`);
      // Continue - tracking failure doesn't fail the operation
    }

    return {
      success: true,
      request: updatedRequest.toObject(),
      message: "Request withdrawn successfully"
    };

  } catch (error) {
    logWithTime(`❌ [withdrawOrgProjectRequestService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to withdraw request",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { withdrawOrgProjectRequestService };
