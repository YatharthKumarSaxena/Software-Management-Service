// services/org-project-requests/approve-org-project-request.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { ClientModel } = require("@models/client.model");
const { ProjectModel } = require("@models/project.model");
const { RequestStatus } = require("@configs/enums.config");
const { NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { createStakeholderService } = require("@services/stakeholders/create-stakeholder.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");

/**
 * Approves an org project request (project owner/manager only)
 * 
 * Side effects:
 * - Updates request status to APPROVED
 * - Creates stakeholder record for client in project
 * - Logs activity tracker event for the approval
 * 
 * @param {Object} params
 * @param {Object} params.request - Pre-fetched OrgProjectRequest object
 * @param {string} params.approveReasonType - Reason type for approval
 * @param {string} params.approveReasonDescription - Reason description for approval
 * @param {string} params.updatedBy - USR ID of the approver
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 * @returns {{ success: boolean, request?: Object, message?: string, errorCode?: string, warning?: string }}
 */
const approveOrgProjectRequestService = async ({
  request,
  approveReasonType,
  approveReasonDescription,
  updatedBy,
  auditContext
}) => {
  try {
    logWithTime(`[approveOrgProjectRequestService] Approving request: ${request._id}`);

    /* ── Step 1: Validate request status ───────────────────────────── */
    if (request.status !== RequestStatus.PENDING) {
      logWithTime(`❌ [approveOrgProjectRequestService] Request status is ${request.status}, must be PENDING`);
      return { success: false, message: `Request is already ${request.status}`, errorCode: BAD_REQUEST };
    }

    /* ── Step 3: Fetch client and project for stakeholder creation ─────── */
    const client = await ClientModel.findById(request.clientId);
    const project = await ProjectModel.findById(request.projectId);

    if (!client) {
      logWithTime(`❌ [approveOrgProjectRequestService] Client not found: ${request.clientId}`);
      return { success: false, message: "Client not found", errorCode: NOT_FOUND };
    }

    if (!project) {
      logWithTime(`❌ [approveOrgProjectRequestService] Project not found: ${request.projectId}`);
      return { success: false, message: "Project not found", errorCode: NOT_FOUND };
    }

    /* ── Step 4: Capture old data for audit ─────────────────────────── */
    const oldData = { ...request.toObject ? request.toObject() : request };

    /* ── Step 5: Update request ──────────────────────────────────────── */
    request.status = RequestStatus.APPROVED;
    request.approveReasonType = approveReasonType;
    request.approveReasonDescription = approveReasonDescription;
    request.approvedAt = new Date();
    request.updatedBy = updatedBy;

    const updatedRequest = await request.save();
    logWithTime(`✅ [approveOrgProjectRequestService] Request approved: ${request._id}`);

    /* ── Step 2: Create Stakeholder automatically ──────────────────────── */
    let stakeholderCreated = false;
    try {
      const stakeholderResult = await createStakeholderService({
        projectId: project._id,
        userId: client._id,
        role: client.clientType || "CLIENT",
        organizationId: request.organizationId,
        createdBy: updatedBy,
        auditContext: {
          user: auditContext?.user || null,
          device: auditContext?.device || null,
          requestId: request._id
        }
      });

      if (!stakeholderResult.success) {
        logWithTime(`⚠️  [approveOrgProjectRequestService] Stakeholder creation failed: ${stakeholderResult.message}`);
        // Request is approved but stakeholder creation failed - this is a warning situation
        return {
          success: true,
          request: updatedRequest.toObject(),
          message: "Request approved but stakeholder creation failed",
          warning: stakeholderResult.message
        };
      }

      stakeholderCreated = true;
      logWithTime(`✅ [approveOrgProjectRequestService] Stakeholder created for client ${client._id}`);

    } catch (stakeholderError) {
      logWithTime(`⚠️  [approveOrgProjectRequestService] Stakeholder creation error: ${stakeholderError.message}`);
      return {
        success: true,
        request: updatedRequest.toObject(),
        message: "Request approved but stakeholder creation encountered an error",
        warning: stakeholderError.message
      };
    }

    /* ── Step 7: Log activity tracker event ──────────────────────────── */
    if (stakeholderCreated) {
      const { user, device, requestId: auditRequestId } = auditContext || {};
      const { oldData: auditOldData, newData: auditNewData } = prepareAuditData(oldData, updatedRequest);

      logActivityTrackerEvent(
        user,
        device,
        auditRequestId,
        ACTIVITY_TRACKER_EVENTS.APPROVE_ORG_PROJECT_REQUEST,
        `Organization project request approved. Reason: ${approveReasonType}${approveReasonDescription ? ` - ${approveReasonDescription}` : ''}. Stakeholder created for client.`,
        { oldData: auditOldData, newData: auditNewData, adminActions: { targetId: request._id } }
      );
    }

    return {
      success: true,
      request: updatedRequest.toObject(),
      message: "Request approved successfully and stakeholder created"
    };

  } catch (error) {
    logWithTime(`❌ [approveOrgProjectRequestService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to approve request",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { approveOrgProjectRequestService };

