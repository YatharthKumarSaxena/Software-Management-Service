const { logMiddlewareError, throwSpecificInternalServerError, throwInternalServerError } = require("@/responses/common/error-handler.response");
const { checkElicitationNotFrozen, checkNegotiationNotFrozen } = require("../common/check-phase-frozen.middleware");

const checkPhaseFrozenStatusMiddleware = async (req, res, next) => {
    try {
        const latestElicitation = req.elicitation || null;
        const latestNegotiation = req.negotiation || null;
        if (!latestElicitation && !latestNegotiation) {
            logMiddlewareError("checkPhaseFrozenStatus", "No Elicitation or Negotiation found for the project", req);
            return throwSpecificInternalServerError(res, "No Elicitation or Negotiation found for the project,. Run the Fetch Entity middleware before this middleware.");
        }
        // Fetch Latest Elicitation or Negotioation ID for the project
        if (latestElicitation) {
            return checkElicitationNotFrozen(req, res, next);
        } else if (latestNegotiation) {
            return checkNegotiationNotFrozen(req, res, next);
        }
        logMiddlewareError("checkPhaseFrozenStatus", "No valid Elicitation or Negotiation found for the project", req);
        return throwSpecificInternalServerError(res, "No valid Elicitation or Negotiation found for the project,. Run the Fetch Entity middleware before this middleware.");
    } catch (error) {
        logMiddlewareError("checkPhaseFrozenStatus", `Error fetching entity ID: ${error.message}`, req);
        return throwInternalServerError(res, "Error fetching entity ID");
    }
}

module.exports = {
    checkPhaseFrozenStatusMiddleware
}