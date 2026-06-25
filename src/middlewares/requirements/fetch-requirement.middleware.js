// middlewares/requirements/fetch-requirement.middleware.js

const { RequirementModel } = require("@models/requirement.model");

const {
    createFetchModelMiddleware
} = require("../factory/fetch-model.middleware-factory");

const fetchRequirementMiddleware =
    createFetchModelMiddleware({
        model: RequirementModel,
        modelName: "Requirement",

        idParamName: "requirementId",
        requestKey: "requirement",

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
    fetchRequirementMiddleware
};