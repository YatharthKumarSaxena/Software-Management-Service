// middlewares/scopes/fetch-scope.middleware.js

const { ScopeModel } = require("@models/scope-model");
const { createFetchModelMiddleware } = require("../factory/fetch-model.middleware-factory");

const fetchScopeMiddleware = createFetchModelMiddleware({
        model: ScopeModel,
        modelName: "Scope",

        idParamName: "scopeId",
        requestKey: "scope",

        additionalQuery: {
            isDeleted: false
        },

        attachFields: [
            {
                source: "projectId",
                target: "projectId"
            }
        ]
    });

module.exports = {
    fetchScopeMiddleware
};

