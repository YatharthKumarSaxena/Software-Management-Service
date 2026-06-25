const { StakeholderModel } = require("@models/stakeholder.model");

const {
    createFetchModelMiddleware
} = require("@middlewares/factory/fetch-model.middleware-factory");

const fetchStakeholderMiddleware =
    createFetchModelMiddleware({

        model: StakeholderModel,

        modelName: "Stakeholder",

        idParamName: "stakeholderId",

        requestKey: "foundStakeholder",

        additionalQuery: {
            isDeleted: false
        },

        useLean: false
    });

module.exports = {
    fetchStakeholderMiddleware
};