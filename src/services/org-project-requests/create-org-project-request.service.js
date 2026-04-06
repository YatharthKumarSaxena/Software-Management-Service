// services/org-project-requests/create-org-project-request.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { ProjectModel } = require("@models/project.model");
const { ClientModel } = require("@models/client.model");
const { RequestStatus, ProjectStatus } = require("@configs/enums.config");
const { NOT_FOUND, BAD_REQUEST, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

/**
 * Creates an org project request for a client
 * 
 * Validations:
 * 1. Client must have the organization in their organizationIds
 * 2. Project must exist and be in ACTIVE status
 * 3. Client cannot be already a member of the project stakeholders
 * 4. No existing pending or approved request should exist
 * 
 * Side effects:
 * - Creates OrgProjectRequest record with status PENDING
 * - Logs activity tracker event for the request creation
 * 
 * NOTE: Stakeholder is NOT created here. It will be created when request is APPROVED.
 * 
 * @param {Object} params
 * @param {string} params.projectId - Project ID
 * @param {string} params.organizationId - Organization ID
 * @param {string} params.clientId - Client ID (the requester)
 * @param {Object} params.auditContext - Audit context {user, device, requestId}
 * @returns {{ success: boolean, request?: Object, message?: string, errorCode?: string }}
 */
const createOrgProjectRequestService = async ({
  project,
  organizationId,
  clientId,
  auditContext
}) => {
  try {

    const projectId = project._id;

    logWithTime(`[createOrgProjectRequestService] Starting org project request creation | projectId: ${projectId} | organizationId: ${organizationId} | clientId: ${clientId}`);

    /* ── Validation: Client exists ──────────────────────────────────── */
    const client = await ClientModel.findOne({
      $or: [{ _id: clientId }, { clientId: clientId }],
      isDeleted: false
    });

    if (!client) {
      logWithTime(`❌ [createOrgProjectRequestService] Client not found: ${clientId}`);
      return { success: false, message: "Client not found", errorCode: NOT_FOUND };
    }

    /* ── Validation: Client has organization in organizationIds ────── */
    const hasOrg = client.organizationIds && client.organizationIds.some(
      id => id.toString() === organizationId.toString()
    );

    if (!hasOrg) {
      logWithTime(`❌ [createOrgProjectRequestService] Client ${clientId} does not have organization ${organizationId}`);
      return { success: false, message: "Client does not have the specified organization", errorCode: BAD_REQUEST };
    }

    /* ── Validation: Organization is part of the project ──────────── */
    const projectHasOrg = project.orgIds && project.orgIds.some(
      id => id.toString() === organizationId.toString()
    );

    if (!projectHasOrg) {
      logWithTime(`❌ [createOrgProjectRequestService] Project ${projectId} does not have organization ${organizationId}`);
      return { success: false, message: "Organization is not part of this project", errorCode: BAD_REQUEST };
    }

    /* ── Validation: Client is not already a project stakeholder ─────── */
    const StakeholderModel = require("@models/stakeholder.model");
    const existingStakeholder = await StakeholderModel.findOne({
      projectId: project._id,
      userId: client._id,
      isDeleted: false
    });

    if (existingStakeholder) {
      logWithTime(`❌ [createOrgProjectRequestService] Client ${clientId} is already a stakeholder of project ${projectId}`);
      return { success: false, message: "Client is already a member of this project", errorCode: CONFLICT };
    }

    /* ── Validation: No existing pending or approved request ──────────── */
    const existingRequest = await OrgProjectRequest.findOne({
      projectId: project._id,
      clientId: client._id,
      status: { $in: [RequestStatus.PENDING, RequestStatus.APPROVED] },
      isDeleted: false
    });

    if (existingRequest) {
      logWithTime(`❌ [createOrgProjectRequestService] Existing request found with status ${existingRequest.status}`);
      return { 
        success: false, 
        message: `An active request already exists with status: ${existingRequest.status}`,
        errorCode: CONFLICT
      };
    }

    /* ── Create OrgProjectRequest ────────────────────────────────────── */
    const orgProjectRequest = new OrgProjectRequest({
      projectId: project._id,
      clientId: client._id,
      organizationId: organizationId,
      status: RequestStatus.PENDING,
      createdBy: client._id
    });

    await orgProjectRequest.save();
    logWithTime(`✅ [createOrgProjectRequestService] OrgProjectRequest created with ID: ${orgProjectRequest._id}`);

    /* ── Log activity tracker event ────────────────────────────────── */
    try {
      const { user, device, requestId: auditRequestId } = auditContext || {};
      logActivityTrackerEvent(
        user,
        device,
        auditRequestId,
        ACTIVITY_TRACKER_EVENTS.CREATE_ORG_PROJECT_REQUEST,
        `Organization project join request created. Project: ${project._id}, Organization: ${organizationId}`,
        { 
          adminActions: { 
            targetId: orgProjectRequest._id.toString(),
            clientId: client._id.toString(),
            projectId: project._id.toString()
          } 
        }
      );
    } catch (trackerError) {
      logWithTime(`⚠️  [createOrgProjectRequestService] Activity tracker logging failed: ${trackerError.message}`);
      // Continue - tracking failure doesn't fail the operation
    }

    return {
      success: true,
      request: orgProjectRequest.toObject(),
      message: "Org project request created successfully"
    };

  } catch (error) {
    logWithTime(`❌ [createOrgProjectRequestService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to create org project request",
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { createOrgProjectRequestService };
