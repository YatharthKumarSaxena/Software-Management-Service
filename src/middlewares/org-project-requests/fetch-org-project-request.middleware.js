const { OrgProjectRequest } = require("@models/org-project-request.model");

const {
    createFetchModelMiddleware
} = require("@middlewares/factory/fetch-model.middleware-factory");

const fetchOrgProjectRequestMiddleware =
    createFetchModelMiddleware({
        model: OrgProjectRequest,
        modelName: "Org Project Request",
        idParamName: "requestId",
        requestKey: "orgProjectRequest"
    });

module.exports = {
    fetchOrgProjectRequestMiddleware
};