// services/org-project-requests/reject-org-project-request.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { RequestStatus } = require("@configs/enums.config");
const { NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Rejects an org project request (project owner/manager only)
 * 
 * @param {Object} params
 * @param {Object} params.request - Pre-fetched OrgProjectRequest object
 * @param {string} params.rejectReasonType - Reason type for rejection
 * @param {string} params.rejectReasonDescription - Reason description for rejection
 * @param {string} params.updatedBy - USR ID of the rejector
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 * @returns {{ success: boolean, request?: Object, message?: string, errorCode?: string }}
 */
const rejectOrgProjectRequestService = async ({
  request,
  rejectReasonType,
  rejectReasonDescription,
  updatedBy,
  auditContext
}) => {
  try {
    logWithTime(`[rejectOrgProjectRequestService] Rejecting request: ${request._id}`);

    /* ── Validation: Request must be PENDING ──────────────────────────── */
    if (request.status !== RequestStatus.PENDING) {
      logWithTime(`❌ [rejectOrgProjectRequestService] Request status is ${request.status}, must be PENDING`);
      return { success: false, message: `Request is already ${request.status}`, errorCode: BAD_REQUEST };
    }

    /* ── Capture old data for audit ────────────────────────────────── */
    const oldData = { ...request.toObject ? request.toObject() : request };

    /* ── Update request ──────────────────────────────────────────────── */
    request.status = RequestStatus.REJECTED;
    request.rejectReasonType = rejectReasonType;
    request.rejectReasonDescription = rejectReasonDescription;
    request.rejectedAt = new Date();
    request.updatedBy = updatedBy;

    const updatedRequest = await request.save();
    logWithTime(`✅ [rejectOrgProjectRequestService] Request rejected: ${request._id}`);

    /* ── Log activity tracker event ──────────────────────────────── */
    try {
      const { user, device, requestId: auditRequestId } = auditContext || {};
      const { oldData: auditOldData, newData: auditNewData } = prepareAuditData(oldData, updatedRequest);

      logActivityTrackerEvent(
        user,
        device,
        auditRequestId,
        ACTIVITY_TRACKER_EVENTS.REJECT_ORG_PROJECT_REQUEST,
        `Organization project request rejected. Reason: ${rejectReasonType}${rejectReasonDescription ? ` - ${rejectReasonDescription}` : ''}`,
        { oldData: auditOldData, newData: auditNewData, adminActions: { targetId: request._id } }
      );
    } catch (trackerError) {
      logWithTime(`⚠️  [rejectOrgProjectRequestService] Activity tracker logging failed: ${trackerError.message}`);
      // Continue - tracking failure doesn't fail the operation
    }

    return {
      success: true,
      request: updatedRequest.toObject(),
      message: "Request rejected successfully"
    };

  } catch (error) {
    logWithTime(`❌ [rejectOrgProjectRequestService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to reject request",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { rejectOrgProjectRequestService };

