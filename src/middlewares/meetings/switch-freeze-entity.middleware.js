const { logMiddlewareError, throwSpecificInternalServerError, throwInternalServerError } = require("@/responses/common/error-handler.response");
const { checkElicitationNotFrozen, checkNegotiationNotFrozen, checkElaborationNotFrozen, checkInceptionNotFrozen, checkSpecificationNotFrozen, checkValidationNotFrozen } = require("../common/check-phase-frozen.middleware");

const checkPhaseFrozenStatusMiddleware = async (req, res, next) => {
    try {
        // Destructure to neatly access variables, defaulting to null if undefined
        const { elicitation, negotiation, specification, validation, inception, elaboration } = req;

        // Check if absolutely no phase exists
        if (!elicitation && !negotiation && !specification && !validation && !inception && !elaboration) {
            logMiddlewareError("checkPhaseFrozenStatus", "No valid phase entity found for the project", req);
            return throwSpecificInternalServerError(res, "No valid phase entity found for the project. Run the Fetch Entity middleware before this middleware.");
        }

        // Based on the original logic, route to the correct check middleware
        if (elicitation) return checkElicitationNotFrozen(req, res, next);
        if (negotiation) return checkNegotiationNotFrozen(req, res, next);
        if (specification) return checkSpecificationNotFrozen(req, res, next);
        if (validation) return checkValidationNotFrozen(req, res, next);
        if (inception) return checkInceptionNotFrozen(req, res, next);
        if (elaboration) return checkElaborationNotFrozen(req, res, next);

        // If it reaches here, it means a phase exists but it's not Elicitation or Negotiation
        logMiddlewareError("checkPhaseFrozenStatus", "No valid Elicitation or Negotiation found for the project", req);
        return throwSpecificInternalServerError(res, "No valid Elicitation or Negotiation found for the project. Run the Fetch Entity middleware before this middleware.");
        
    } catch (error) {
        logMiddlewareError("checkPhaseFrozenStatus", `Error in phase frozen check: ${error.message}`, req);
        return throwInternalServerError(res, "Error checking phase frozen status");
    }
};

module.exports = {
    checkPhaseFrozenStatusMiddleware
};