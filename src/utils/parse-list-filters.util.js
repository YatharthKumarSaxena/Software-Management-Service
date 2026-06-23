// utils/parse-list-filters.util.js

const parseListFilters = (query) => {

    const filters = {};

    if (query.query) {
        filters.query =
            JSON.parse(query.query);
    }

    if (query.selectFields) {
        filters.selectFields =
            JSON.parse(query.selectFields);
    }

    if (query.pageNumber) {
        filters.pageNumber =
            Number(query.pageNumber);
    }

    if (query.pageSize) {
        filters.pageSize =
            Number(query.pageSize);
    }

    if (query.sortField) {
        filters.sortField =
            query.sortField;
    }

    if (query.sortOrder) {
        filters.sortOrder =
            query.sortOrder;
    }

    return filters;
};

module.exports = {
    parseListFilters
};