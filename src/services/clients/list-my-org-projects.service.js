// services/clients/list-my-org-projects.service.js

const ProjectModel = require("@models/project.model");
const ClientModel = require("@models/client.model");
const { ProjectStatus } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Lists all ACTIVE org projects that the client's organizations are part of
 * 
 * Returns limited project details: name, status, ownerId
 * 
 * @param {Object} params
 * @param {string} params.clientId - Client ID
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Results per page (default: 10)
 * @returns {{ success: boolean, projects?: Object[], total?: number, page?: number, limit?: number, message?: string }}
 */
const listMyOrgProjectsService = async ({
  clientId,
  page = 1,
  limit = 10
}) => {
  try {
    logWithTime(`[listMyOrgProjectsService] Listing org projects for client: ${clientId}`);

    /* ── Get client to access organizationIds ─────────────────────── */
    const client = await ClientModel.findOne({
      $or: [{ _id: clientId }, { clientId: clientId }],
      isDeleted: false
    });

    if (!client) {
      logWithTime(`❌ [listMyOrgProjectsService] Client not found: ${clientId}`);
      return { success: false, message: "Client not found" };
    }

    const clientOrgIds = client.organizationIds || [];

    if (clientOrgIds.length === 0) {
      logWithTime(`ℹ️  [listMyOrgProjectsService] Client has no organizations`);
      return {
        success: true,
        projects: [],
        total: 0,
        page,
        limit,
        message: "Client has no organizations"
      };
    }

    /* ── Query projects where: orgIds contains client's orgs + status = ACTIVE ─ */
    const filter = {
      orgIds: { $in: clientOrgIds },
      projectStatus: ProjectStatus.ACTIVE,
      isDeleted: false
    };

    const skip = (page - 1) * limit;

    const projects = await ProjectModel.find(filter)
      .select("name projectStatus ownerId orgIds createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ProjectModel.countDocuments(filter);

    // Return only limited details
    const limitedProjects = projects.map(proj => ({
      projectId: proj._id,
      name: proj.name,
      status: proj.projectStatus,
      ownerId: proj.ownerId,
      createdAt: proj.createdAt
    }));

    return {
      success: true,
      projects: limitedProjects,
      total,
      page,
      limit,
      message: "Org projects retrieved successfully"
    };

  } catch (error) {
    logWithTime(`❌ [listMyOrgProjectsService] Error: ${error.message}`);
    return {
      success: false,
      message: "Failed to list org projects",
      error: error.message
    };
  }
};

module.exports = { listMyOrgProjectsService };
