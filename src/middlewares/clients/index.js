const { clientApiAuthorizationMiddleware } = require("./client-api-authorization.middleware");
const { ensureClientExists, ensureClientNew, fetchRequestClient } = require("./fetch-client.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const clientMiddlewares = {
    ensureClientExists,
    ensureClientNew,
    fetchRequestClient,
    ...validationMiddlewares,
    ...presenceMiddlewares,
    clientApiAuthorizationMiddleware
}

module.exports = { 
    clientMiddlewares
};