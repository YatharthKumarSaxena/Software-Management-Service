const { duplicateQueryParameterHandler } = require("./duplicate-query-parameter.handler");
const { malformedJsonHandler } = require("./malformed-request-handler.middleware");
const { unknownRouteHandler } = require("./unknown-route-handler.middleware");

const handlers = {
    duplicateQueryParameterHandler,
    malformedJsonHandler,
    unknownRouteHandler
}

module.exports = {
    handlers
}