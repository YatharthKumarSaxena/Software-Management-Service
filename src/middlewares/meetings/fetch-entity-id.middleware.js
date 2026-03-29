const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { ElicitationModel } = require("@/models/elicitation.model");
const { NegotiationModel } = require("@/models/negotiation.model");
const { throwBadRequestError, logMiddlewareError, throwDBResourceNotFoundError, throwInternalServerError, throwValidationError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const validEntityTypes = {
    [DB_COLLECTIONS.ELICITATIONS]: DB_COLLECTIONS.ELICITATIONS,
    [DB_COLLECTIONS.NEGOTIATIONS]: DB_COLLECTIONS.NEGOTIATIONS
}

const fetchEntityIdMiddleware = async (req, res, next) => {
    try {
        const { entityType } = req.params;
        const project = req.project;
        const projectId = project._id;
        
        if (!entityType) {
            logMiddlewareError("fetchEntityId", "entityType parameter is missing", req);
            return throwBadRequestError(res, "entityType parameter is required");
        }

        if (!Object.values(validEntityTypes).includes(entityType)) {
            logMiddlewareError("fetchEntityId", `Invalid entityType: ${entityType}`, req);
            const validValues = Object.values(validEntityTypes).join(", ");
            return throwValidationError(res, [{
                field: "entityType",
                message: `entityType must be one of: ${validValues}`,
                received: entityType
            }]);
        }

        // Fetch Latest Elicitation or Negotioation ID for the project
        if (entityType === DB_COLLECTIONS.ELICITATIONS) {
            const latestElicitation = await ElicitationModel.findOne({ projectId: projectId }).sort({ "version.major": -1 }).lean();
            if (!latestElicitation) {
                logMiddlewareError("fetchEntityId", "No elicitation found for the project", req);
                return throwDBResourceNotFoundError(res, "Elicitation not found");
            }
            req.parentEntity = latestElicitation;
            req.elicitation = latestElicitation; // Attach for version control in create
            req.projectId = latestElicitation.projectId; // Attach projectId for downstream use
        } else if (entityType === DB_COLLECTIONS.NEGOTIATIONS) {
            const latestNegotiation = await NegotiationModel.findOne({ projectId: projectId }).sort({ "version.major": -1 }).lean();
            if (!latestNegotiation) {
                logMiddlewareError("fetchEntityId", "No negotiation found for the project", req);
                return throwDBResourceNotFoundError(res, "Negotiation not found");
            }
            req.parentEntity = latestNegotiation;
            req.negotiation = latestNegotiation; // Attach for version control in create
            req.projectId = latestNegotiation.projectId; // Attach projectId for downstream use
        }
        logWithTime(`✅ Entity fetched successfully for type ${entityType} | Entity ID: ${req.parentEntity._id}`);
        return next();
    } catch (error) {
        logMiddlewareError("fetchEntityId", `Error fetching entity ID: ${error.message}`, req);
        return throwInternalServerError(res, "Error fetching entity ID");
    }
}

module.exports = {
    fetchEntityIdMiddleware
}