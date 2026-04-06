// services/org-project-requests/list-project-org-requests.service.js

const { OrgProjectRequest } = require("@models/org-project-request.model");
const { ProjectModel } = require("@models/project.model");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Lists all org project requests for a specific project (project owner/manager only)
 * 
 * @param {Object} params
 * @param {string} params.projectId - Project ID
 * @param {string} params.status - Filter by status (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Results per page (default: 10)
 * @returns {{ success: boolean, requests?: Object[], total?: number, page?: number, limit?: number, message?: string }}
 */
const listProjectOrgRequestsService = async ({
  projectId,
  status = null,
  page = 1,
  limit = 10
}) => {
  try {
    logWithTime(`[listProjectOrgRequestsService] Listing requests for project: ${projectId}`);

    /* ── Validation: Project exists ──────────────────────────────────── */
    const project = await ProjectModel.findOne({
      $or: [{ _id: projectId }, { projectId: projectId }],
      isDeleted: false
    });

    if (!project) {
      logWithTime(`❌ [listProjectOrgRequestsService] Project not found: ${projectId}`);
      return { success: false, message: "Project not found", errorCode: NOT_FOUND };
    }

    const filter = {
      projectId: project._id,
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

    return {
      success: true,
      requests: requests.map(r => r.toObject()),
      total,
      page,
      limit,
      message: "Project requests retrieved successfully"
    };

  } catch (error) {
    logWithTime(`❌ [listProjectOrgRequestsService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to list project requests",
      error: error.message,
      errorCode: INTERNAL_ERROR
    };
  }
};

module.exports = { listProjectOrgRequestsService };
