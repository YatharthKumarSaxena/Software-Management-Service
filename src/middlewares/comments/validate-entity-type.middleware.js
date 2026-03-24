// middlewares/comments/validate-entity-type.middleware.js

const { ScopeModel } = require("@models/scope-model");
const { RequirementModel } = require("@models/requirement.model");
const { InceptionModel } = require("@models/inception.model");
const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { DB_COLLECTIONS } = require("@configs/db-collections.config");
const { throwDBResourceNotFoundError, throwInternalServerError, logMiddlewareError, throwBadRequestError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { ScopeTypes, RequirementTypes, CommentOtherEntityTypes } = require("@/configs/enums.config");
const mongoose = require("mongoose");

/**
 * Entity type to model mapping
 */
const ENTITY_MODEL_MAP = {
  [DB_COLLECTIONS.REQUIREMENTS]: RequirementModel,
  [DB_COLLECTIONS.SCOPES]: ScopeModel,
  [DB_COLLECTIONS.INCEPTIONS]: InceptionModel,
  [DB_COLLECTIONS.HIGH_LEVEL_FEATURES]: HighLevelFeatureModel,
};

const ENTITY_TYPE_MAP = {
  [DB_COLLECTIONS.SCOPES]: Object.values(ScopeTypes),
  [DB_COLLECTIONS.REQUIREMENTS]: Object.values(RequirementTypes),
  [DB_COLLECTIONS.INCEPTIONS]: [CommentOtherEntityTypes.PRODUCT_VISION],
  [DB_COLLECTIONS.HIGH_LEVEL_FEATURES]: []
};

/**
 * Fetch entity from database and auto-extract subEntityType from entity.type field
 * 
 * Prerequisites:
 * - entityType: Already validated via validateBody factory middleware
 * - entityId: Already validated via validateBody factory middleware
 * 
 * Attaches validated data to req.commentEntityData:
 * {
 *   entityType: string,
 *   entityId: string,
 *   subEntityType: string (auto-extracted from entity.type),
 *   entity: Document
 * }
 * 
 * @middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * @returns {void}
 */

const validateEntityTypeMiddleware = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.body;

    // ── Fetch the entity from database ───────────────────────────────────
    const EntityModel = ENTITY_MODEL_MAP[entityType];

    const objectId = new mongoose.Types.ObjectId(entityId);

    const entity = await EntityModel.findById(objectId);
    if (!entity) {
      logMiddlewareError(`validateEntityType`, `Entity not found | entityType: ${entityType}, entityId: ${entityId}`, req);
      return throwDBResourceNotFoundError(res, `${entityType} with ID ${entityId} not found`);
    }

    // ── Auto-extract subEntityType ─────────────────

    let subEntityType = null;

    if (entityType === DB_COLLECTIONS.INCEPTIONS) {
      subEntityType = CommentOtherEntityTypes.PRODUCT_VISION;
    } else {
      subEntityType = entity.type || null;
    }

    // ── Validate subEntityType ────────────────────
    const allowedTypes = ENTITY_TYPE_MAP[entityType] || [];

    if (subEntityType && !allowedTypes.includes(subEntityType)) {
      logMiddlewareError(
        `validateEntityType`,
        `Invalid subEntityType '${subEntityType}' for entityType '${entityType}'`,
        req
      );

      return throwBadRequestError(
        res,
        `Invalid subEntityType '${subEntityType}' for entityType '${entityType}'`
      );
    }

    // ── Extract projectId from entity ───────────────────────────────────
    const projectId = entity.projectId;

    if (!projectId) {
      logMiddlewareError(
        `validateEntityType`,
        `Entity missing projectId | entityType: ${entityType}, entityId: ${entityId}`,
        req
      );
      return throwBadRequestError(res, "Entity missing required project association");
    }

    // ── Attach validated data to request ─────────────────────────────────
    req.commentEntityData = {
      entityType,
      entityId,
      subEntityType,
      entity,
      projectId,
    };

    req.projectId = projectId; // Attach projectId to request for downstream middlewares/services

    logWithTime(`✅ Entity fetched | entityType: ${entityType}, entityId: ${entityId}, subEntityType: ${subEntityType}, projectId: ${projectId}`);
    return next();

  } catch (error) {
    logMiddlewareError(`validateEntityType`, `Error: ${error.message}`, req);
    return throwInternalServerError(res, "Internal server error");
  }
};

module.exports = {
  validateEntityTypeMiddleware
};
