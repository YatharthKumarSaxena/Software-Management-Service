const { 
    authServiceMiddleware,
    adminPanelServiceMiddleware
} = require("@middlewares/internals/verify-service-name.middleware");
const { commonMiddlewares } = require("@middlewares/common/index");
const { adminMiddlewares } = require("@/middlewares/admins");
const { clientMiddlewares } = require("@/middlewares/clients");
const { projectMiddlewares } = require("@/middlewares/projects");

const baseMiddlewares = [
    commonMiddlewares.requestIdMiddleware,
    commonMiddlewares.workflowIdMiddleware,
    commonMiddlewares.verifyDeviceField,
    commonMiddlewares.isDeviceBlocked
];

const accountStatusMiddlewares = [
    commonMiddlewares.isUserAccountBlocked,
    commonMiddlewares.isUserAccountActive
]

const authInternalMiddlewares = [
    ...baseMiddlewares,
    authServiceMiddleware
];

const baseAuthMiddlewares = [
    ...baseMiddlewares,
    commonMiddlewares.validateRedisPayloadMiddleware,
    commonMiddlewares.validateJwtPayloadMiddleware,
    commonMiddlewares.verifyJWTSignatureMiddleware
]

const baseAuthAdminMiddlewares = [
    ...baseAuthMiddlewares,
    adminMiddlewares.fetchRequestAdmin,
    ...accountStatusMiddlewares
]

const baseAuthClientMiddlewares = [
    ...baseAuthMiddlewares,
    clientMiddlewares.fetchRequestClient,
    ...accountStatusMiddlewares
];

const baseAuthClientOrAdminMiddlewares = [
    ...baseAuthMiddlewares,
    commonMiddlewares.fetchAuthUserMiddleware, // Fetches either admin or client based on JWT
    ...accountStatusMiddlewares
]

const checkClientIsStakeholder = [
    ...baseAuthClientMiddlewares,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
]

const checkAdminIsStakeholder = [
    ...baseAuthAdminMiddlewares,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
]

const adminPanelInternalMiddlewares = [
    ...baseMiddlewares,
    adminPanelServiceMiddleware
];


module.exports = {
    authInternalMiddlewares,
    adminPanelInternalMiddlewares,
    baseAuthAdminMiddlewares,
    baseAuthClientMiddlewares,
    baseAuthClientOrAdminMiddlewares,
    checkClientIsStakeholder,
    checkAdminIsStakeholder
};