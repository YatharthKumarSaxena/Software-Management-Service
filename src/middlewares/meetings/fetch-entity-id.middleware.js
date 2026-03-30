const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { InceptionModel } = require("@/models/inception.model");
const { ElicitationModel } = require("@/models/elicitation.model");
const { NegotiationModel } = require("@/models/negotiation.model");
const { SpecificationModel } = require("@/models/specification.model");
const { ElaborationModel } = require("@/models/elaboration.model");
const { ValidationModel } = require("@/models/validation.model");
const { throwBadRequestError, logMiddlewareError, throwDBResourceNotFoundError, throwInternalServerError, throwValidationError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { 
    checkInceptionNotFrozen, checkElicitationNotFrozen, checkElaborationNotFrozen, 
    checkNegotiationNotFrozen, checkSpecificationNotFrozen, checkValidationNotFrozen 
} = require("../common/check-phase-frozen.middleware");

// 1. Map each entity type to its model, request key, and validation function
const ENTITY_CONFIG = {
    [DB_COLLECTIONS.INCEPTIONS]:     { model: InceptionModel,     reqKey: "inception",     validateStatus: checkInceptionNotFrozen },
    [DB_COLLECTIONS.ELICITATIONS]:   { model: ElicitationModel,   reqKey: "elicitation",   validateStatus: checkElicitationNotFrozen },
    [DB_COLLECTIONS.NEGOTIATIONS]:   { model: NegotiationModel,   reqKey: "negotiation",   validateStatus: checkNegotiationNotFrozen },
    [DB_COLLECTIONS.SPECIFICATIONS]: { model: SpecificationModel, reqKey: "specification", validateStatus: checkSpecificationNotFrozen },
    [DB_COLLECTIONS.ELABORATIONS]:   { model: ElaborationModel,   reqKey: "elaboration",   validateStatus: checkElaborationNotFrozen },
    [DB_COLLECTIONS.VALIDATIONS]:    { model: ValidationModel,    reqKey: "validation",    validateStatus: checkValidationNotFrozen }
};

const fetchEntityIdMiddleware = async (req, res, next) => {
    try {
        const { entityType } = req.params;
        const projectId = req.project._id;
        
        if (!entityType) {
            logMiddlewareError("fetchEntityId", "entityType parameter is missing", req);
            return throwBadRequestError(res, "entityType parameter is required");
        }

        const config = ENTITY_CONFIG[entityType];

        // 2. Validate entity type gracefully using the config map
        if (!config) {
            logMiddlewareError("fetchEntityId", `Invalid entityType: ${entityType}`, req);
            return throwValidationError(res, [{
                field: "entityType",
                message: `entityType must be one of: ${Object.keys(ENTITY_CONFIG).join(", ")}`,
                received: entityType
            }]);
        }

        // 3. Centralized Database Query (Works for all 6 models)
        const latestEntity = await config.model
            .findOne({ projectId, isDeleted: false })
            .sort({ "version.major": -1 })
            .lean();

        if (!latestEntity) {
            logMiddlewareError("fetchEntityId", `No ${config.reqKey} found for the project`, req);
            // Capitalize the first letter for the error message
            const entityName = config.reqKey.charAt(0).toUpperCase() + config.reqKey.slice(1);
            return throwDBResourceNotFoundError(res, `${entityName} not found`);
        }

        // 4. Centralized variable assignment to the request object
        req.parentEntity = latestEntity;
        req[config.reqKey] = latestEntity; 
        req.projectId = latestEntity.projectId;

        logWithTime(`✅ Entity fetched successfully for type ${entityType} | Entity ID: ${req.parentEntity._id}`);
        
        // 5. Forward to the respective validation middleware
        return config.validateStatus(req, res, next);

    } catch (error) {
        logMiddlewareError("fetchEntityId", `Error fetching entity ID: ${error.message}`, req);
        return throwInternalServerError(res, "Error fetching entity ID");
    }
};

module.exports = {
    fetchEntityIdMiddleware
};