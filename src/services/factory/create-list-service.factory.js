// services/common/factories/create-list-service.factory.js

const { queryEngineService } = require(
    "@/services/common/query-engine.service"
);

const createListService = ({
    model,
    hiddenFields = []
}) => {

    return async ({
        query,
        selectFields,
        pageNumber,
        pageSize,
        sortField,
        sortOrder
    }) => {

        return queryEngineService({

            model,

            hiddenFields,

            query,

            selectFields,

            pageNumber,

            pageSize,

            sortField,

            sortOrder
        });
    };
};

module.exports = {
    createListService
};
