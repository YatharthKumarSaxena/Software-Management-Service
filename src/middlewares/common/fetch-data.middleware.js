const {
    validateJsonQuery
} = require("@/middlewares/factory/validate-json-request.middleware-factory");

const listDataMiddleware = validateJsonQuery(
    "listData",
    ["query"]
);

const getDataMiddleware = validateJsonQuery(
    "getData", 
    ["selectFields"]
);

module.exports = {
    listDataMiddleware,
    getDataMiddleware
}