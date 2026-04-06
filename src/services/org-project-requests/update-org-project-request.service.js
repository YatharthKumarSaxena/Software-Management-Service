// services/org-project-requests/update-org-project-request.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { RequestStatus } = require("@configs/enums.config");
const { NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR, FORBIDDEN } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Updates an org project request (client only, only when PENDING)
 * Activity tracker is only logged if actual changes are detected.
 * 
 * @param {Object} params
 * @param {Object} params.request - Pre-fetched OrgProjectRequest object
 * @param {string} params.clientId - Client ID (the requester)
 * @param {string} params.requestDescription - Updated request description (optional)
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 * @returns {{ success: boolean, request?: Object, message?: string, errorCode?: string }}
 */
const updateOrgProjectRequestService = async ({
  request,
  clientId,
  requestDescription = null,
  auditContext
}) => {
  try {
    logWithTime(`[updateOrgProjectRequestService] Updating request: ${request._id}`);

    /* ── Validation: Requester is the client who created the request ─── */
    if (request.clientId.toString() !== clientId.toString()) {
      logWithTime(`❌ [updateOrgProjectRequestService] Unauthorized - client ${clientId} is not the request creator`);
      return { success: false, message: "Unauthorized", errorCode: FORBIDDEN };
    }

    /* ── Validation: Request must be PENDING ──────────────────────────── */
    if (request.status !== RequestStatus.PENDING) {
      logWithTime(`❌ [updateOrgProjectRequestService] Request status is ${request.status}, must be PENDING`);
      return { success: false, message: `Can only update PENDING requests. Current status: ${request.status}`, errorCode: BAD_REQUEST };
    }

    /* ── Capture old data for audit ────────────────────────────────── */
    const oldData = { ...request.toObject ? request.toObject() : request };

    /* ── Update request fields - only if actually changed ──────────── */
    let hasChanges = false;
    if (requestDescription && requestDescription !== request.requestDescription) {
      request.requestDescription = requestDescription;
      hasChanges = true;
    }

    const updatedRequest = await request.save();
    logWithTime(`✅ [updateOrgProjectRequestService] Request updated: ${request._id}`);

    /* ── Log activity tracker event only if changes detected ──────────── */
    if (hasChanges) {
      try {
        const { user, device, requestId: auditRequestId } = auditContext || {};
        const { oldData: auditOldData, newData: auditNewData } = prepareAuditData(oldData, updatedRequest);

        logActivityTrackerEvent(
          user,
          device,
          auditRequestId,
          ACTIVITY_TRACKER_EVENTS.UPDATE_ORG_PROJECT_REQUEST,
          "Organization project request updated by client",
          { oldData: auditOldData, newData: auditNewData, adminActions: { targetId: request._id } }
        );
      } catch (trackerError) {
        logWithTime(`⚠️  [updateOrgProjectRequestService] Activity tracker logging failed: ${trackerError.message}`);
        // Continue - tracking failure doesn't fail the operation
      }
    }

    return {
      success: true,
      request: updatedRequest.toObject(),
      message: "Request updated successfully"
    };

  } catch (error) {
    logWithTime(`❌ [updateOrgProjectRequestService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to update request",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { updateOrgProjectRequestService };
