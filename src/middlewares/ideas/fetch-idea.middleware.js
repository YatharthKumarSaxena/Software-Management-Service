const { IdeaModel } = require("@models/idea.model");

const {
    createFetchModelMiddleware
} = require("@middlewares/factory/fetch-model.middleware-factory");

const fetchIdeaMiddleware =
    createFetchModelMiddleware({

        model: IdeaModel,

        modelName: "Idea",

        idParamName: "ideaId",

        requestKey: "idea",

        additionalQuery: {
            isDeleted: false
        },

        useLean: false,

        attachFields: [
            {
                source: "projectId",
                target: "projectId"
            }
        ]
    });

module.exports = {
    fetchIdeaMiddleware
};