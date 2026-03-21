const { throwSpecificInternalServerError, logMiddlewareError, throwInternalServerError } = require("@/responses/common/error-handler.response");
const { fetchClient } = require("@/services/common/fetch-client.service");
const { fetchAdmin } = require("@/services/common/fetch-admin.service");
const { logWithTime } = require("@/utils/time-stamps.util");

const fetchAuthUserMiddleware = async (req, res, next) => {
    try {    
        const userId = req.userId; // JWT verification middleware ne inject kiya hai
        let user = await fetchClient(null, null, userId); // JWT verification middleware ne inject kiya hai
        if (user) {
            logWithTime(`✅ Authenticated user fetched: ${user.clientId}`);
            req.client = user;
            delete req.userId;
            return next();
        }
        user = await fetchAdmin(null, null, userId); // Admin fetch ke liye userId ko adminId ke roop mein treat karo
        if (user) {
            logWithTime(`✅ Authenticated admin fetched: ${user.adminId}`);
            req.admin = user;
            delete req.userId;
            return next();
        }
        logMiddlewareError("fetchAuthUser", "Neither clientId nor adminId found in request", req);
        return throwSpecificInternalServerError(res, "Invalid authentication context");
    } catch (err) {
        logMiddlewareError("fetchAuthUser", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
}

module.exports = { fetchAuthUserMiddleware };