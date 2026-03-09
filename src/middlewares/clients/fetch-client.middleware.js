const { fetchEntityFactory } = require("@middlewares/factory/fetch-entity.middleware-factory");
const { fetchClient } = require("@/services/common/fetch-client.service");
const { logMiddlewareError } = require("@/utils/log-error.util");
const { throwDBResourceNotFoundError, throwInternalServerError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
/**
 * CASE 1: LOGIN / GET DETAILS
 * Ye check karega ki Client EXIST karta hai.
 * Agar nahi mila -> 404 Error throw karega.
 * Use: Login, Forgot Password, Get Profile
 */
const ensureClientExists = fetchEntityFactory(fetchClient, "Client", true);

/**
 * CASE 2: REGISTRATION
 * Ye check karega ki Client EXIST NAHI karta.
 * Agar mil gaya -> 409 Conflict Error throw karega.
 * Use: Sign Up, Create Client
 */
const ensureClientNew = fetchEntityFactory(fetchClient, "Client", false);

const fetchRequestClient = async (req, res, next) => {
    try {
        const userId = req.userId; // JWT verification middleware ne inject kiya hai
        const foundClient = await fetchClient(null, null, userId);

        if (!foundClient) {
            logMiddlewareError("fetchRequestClient", `Client not found during request client fetch`, req);
            return throwDBResourceNotFoundError(res, "Client");
        }

        logWithTime(`✅ Request client fetched: ${foundClient.clientId}`);

        req.client = foundClient; // Downstream middlewares/controllers ke liye client attach kar diya
        return next();
    } catch (err) {
        logMiddlewareError("fetchRequestClient", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
}

module.exports = { 
    ensureClientExists, 
    ensureClientNew,
    fetchRequestClient
};