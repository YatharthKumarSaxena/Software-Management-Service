const { queryEngineService } = require(
    "@/services/common/query-engine.service"
);

const createListService = ({
    model,
    hiddenFields = [],
    filterableFields = [],
    sortableFields = [],
    searchableFields = []
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

            accessControl: {
                filterableFields,
                sortableFields,
                searchableFields
            },

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