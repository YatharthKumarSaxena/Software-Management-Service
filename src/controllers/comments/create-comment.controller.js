// controllers/comments/create-comment.controller.js

const { createCommentService } = require("@services/comments/create-comment.service");
const { sendCommentCreatedSuccess } = require("@/responses/success/comment.response");
const { StakeholderModel } = require("@models/stakeholder.model");
const { ProjectCategoryTypes } = require("@/configs/enums.config");
const { checkUserRoleType } = require("@/utils/role-check.util");
const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
  throwAccessDeniedError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Controller: Create Comment
 * Allows both admin and client (stakeholder) to create comments/replies on entities
 * Validates that user belongs to the project associated with the entity
 */
const createCommentController = async (req, res) => {
  try {
    const { commentText, parentCommentId } = req.body;
    const commentEntityData = req.commentEntityData;

    // Determine who is creating the comment
    const createdBy = req.admin?.adminId || req.client?.clientId;
    const userId = createdBy;
    const projectId = commentEntityData.projectId;

    // ── Validate user project membership before creating comment ──────────
    const stakeholder = await StakeholderModel.findOne({
      userId: userId,
      projectId: projectId,
      isDeleted: false
    }).lean();

    if (!stakeholder) {
      logWithTime(`❌ [createCommentController] User ${userId} is not a stakeholder of project ${projectId} | ${getLogIdentifiers(req)}`);
      return throwAccessDeniedError(res, "You do not have permission to comment on this entity.");
    }

    // ── For clients, validate organization membership ─────────────────────
    if (req.client) {
      const ProjectModel = require("@models/project.model").ProjectModel;
      const project = await ProjectModel.findById(projectId).lean();
      
      if (!project) {
        logWithTime(`❌ [createCommentController] Project ${projectId} not found | ${getLogIdentifiers(req)}`);
        return throwInternalServerError(res, "Error validating project access");
      }

      const { isClient } = checkUserRoleType(stakeholder.role);

      if (isClient) {
        const stakeholderOrgId = stakeholder.organizationId;

        if (project.projectCategory === ProjectCategoryTypes.ORGANIZATION) {
          const projectOrgId = project.orgIds[0];
          if (stakeholderOrgId != projectOrgId) {
            logWithTime(`❌ [createCommentController] User org mismatch | ${getLogIdentifiers(req)}`);
            return throwAccessDeniedError(res, "Your organisation is not associated with this project.");
          }
        }

        if (project.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION) {
          const orgMatches = Array.isArray(project.orgIds) &&
            project.orgIds.some(id => id.toString() === stakeholderOrgId);

          if (!orgMatches) {
            logWithTime(`❌ [createCommentController] User org not in project org list | ${getLogIdentifiers(req)}`);
            return throwAccessDeniedError(res, "Your organisation is not associated with this project.");
          }
        }
      }
    }

    // ── Call service ──────────────────────────────────────
    const result = await createCommentService({
      commentEntityData,
      commentText,
      createdBy,
      parentCommentId: parentCommentId || null,
      auditContext: {
        user: req.admin || req.client,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Parent comment not found") {
        logWithTime(`❌ [createCommentController] Parent comment not found | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message);
      }

      if (result.message === "Reply must match same entity and sub-entity type") {
        logWithTime(`❌ [createCommentController] Reply entity mismatch | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }

      if (result.message === "Validation error") {
        logWithTime(`❌ [createCommentController] Validation error: ${result.error} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.error);
      }

      logWithTime(`❌ [createCommentController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [createCommentController] Comment created successfully | ${getLogIdentifiers(req)}`);
    return sendCommentCreatedSuccess(res, result.comment);

  } catch (error) {
    logWithTime(`❌ [createCommentController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createCommentController };
