const { requestIdMiddleware } = require("./check-request-id.middleware");
const { isUserAccountActive } = require("./is-account-active.middleware");
const { isDeviceBlocked } = require("./is-device-blocked.middleware");
const { isUserAccountBlocked } = require("./is-user-blocked.middleware");
const { validateJwtPayloadMiddleware } = require("./validate-jwt-payload.middleware");
const { validateRedisPayloadMiddleware } = require("./validate-redis-payload.middleware");
const { verifyDeviceField } = require("./verify-device-field.middleware");
const { verifyJWTSignatureMiddleware } = require("./verify-jwt-signature.middleware");
const { apiAuthorizationMiddleware } = require("../admins/admin-api-authorization.middleware");
const { checkUserIsStakeholder } = require("../stakeholders/check-user-is-stakeholder.middleware");
const { fetchAuthUserMiddleware } = require("./fetch-auth-user.middleware");
const { corsMiddleware } = require('./cors.middleware');

const commonMiddlewares = {
    corsMiddleware,
    requestIdMiddleware,
    isDeviceBlocked,
    verifyDeviceField,
    verifyJWTSignatureMiddleware,
    validateJwtPayloadMiddleware,
    validateRedisPayloadMiddleware,
    isUserAccountBlocked,
    isUserAccountActive,
    apiAuthorizationMiddleware,
    checkUserIsStakeholder,
    fetchAuthUserMiddleware
}

module.exports = {
    commonMiddlewares
}