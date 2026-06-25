// services/common/query-engine.service.js

const {
    INTERNAL_ERROR,
    BAD_REQUEST
} = require("@/configs/http-status.config");

const MAX_PAGE_SIZE = 100;

const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const BAD_REQUEST_ERROR_PREFIXES = [
    "Unknown field",
    "Filtering is not allowed",
    "Field not searchable",
    "Unsupported operator",
    "exists operator",
    "contains operator",
    "startsWith operator",
    "endsWith operator",
    "in operator",
    "nin operator"
];

const SYSTEM_HIDDEN_FIELDS = Object.freeze([
    "__v"
]);

const SEARCH_OPERATORS = new Set([
    "contains",
    "startsWith",
    "endsWith"
]);

const buildCondition = ({
    field,
    operator,
    value
}) => {

    switch (operator) {

        case "eq":
            return {
                [field]: value
            };

        case "ne":
            return {
                [field]: {
                    $ne: value
                }
            };

        case "gt":
            return {
                [field]: {
                    $gt: value
                }
            };

        case "gte":
            return {
                [field]: {
                    $gte: value
                }
            };

        case "lt":
            return {
                [field]: {
                    $lt: value
                }
            };

        case "lte":
            return {
                [field]: {
                    $lte: value
                }
            };

        case "in":
            return {
                [field]: {
                    $in: value
                }
            };

        case "nin":
            return {
                [field]: {
                    $nin: value
                }
            };

        case "exists":
            return {
                [field]: {
                    $exists: value
                }
            };

        case "contains":
            return {
                [field]: {
                    $regex: escapeRegex(value),
                    $options: "i"
                }
            };

        case "startsWith":
            return {
                [field]: {
                    $regex: `^${escapeRegex(value)}`,
                    $options: "i"
                }
            };

        case "endsWith":
            return {
                [field]: {
                    $regex: `${escapeRegex(value)}$`,
                    $options: "i"
                }
            };

        default:
            throw new Error(
                `Unsupported operator: ${operator}`
            );
    }
};

const buildMongoQuery = (node) => {

    if (!node) {
        return {};
    }

    if (node.and) {
        return {
            $and: node.and.map(buildMongoQuery)
        };
    }

    if (node.or) {
        return {
            $or: node.or.map(buildMongoQuery)
        };
    }

    return buildCondition(node);
};

const queryEngineService = async ({

    model,

    query = {},

    selectFields = [],

    pageNumber = 1,

    pageSize = 10,

    sortField = "createdAt",

    sortOrder = "desc",

    hiddenFields = [],

    accessControl = {}

}) => {

    try {

        const schemaFieldList = Object.keys(model.schema.paths);
        const schemaFields = new Set(schemaFieldList);

        const finalHiddenFields = new Set([
            ...SYSTEM_HIDDEN_FIELDS,
            ...hiddenFields
        ]);

        const isHidden = (field) => {
            for (const hidden of finalHiddenFields) {
                if (
                    field === hidden ||
                    field.startsWith(`${hidden}.`)
                ) {
                    return true;
                }
            }
            return false;
        };

        const allowedFields = schemaFieldList.filter(
            field => !isHidden(field)
        );

        const allowedFieldSet = new Set(allowedFields);

        const safeSelectFields =
            (selectFields || []).filter(field =>
                allowedFieldSet.has(field)
            );

        const filterableFields = new Set(
            accessControl.filterableFields?.length
                ? accessControl.filterableFields
                : allowedFields
        );

        const sortableFields = new Set(
            accessControl.sortableFields?.length
                ? accessControl.sortableFields
                : allowedFields
        );

        const searchableFields = new Set(
            accessControl.searchableFields?.length
                ? accessControl.searchableFields
                : allowedFields
        );

        const validateNode = (node) => {

            if (!node) return;

            if (node.and) {
                node.and.forEach(validateNode);
                return;
            }

            if (node.or) {
                node.or.forEach(validateNode);
                return;
            }

            if (!schemaFields.has(node.field)) {
                throw new Error(
                    `Unknown field: ${node.field}`
                );
            }

            if (!filterableFields.has(node.field)) {
                throw new Error(
                    `Filtering is not allowed on field: ${node.field}`
                );
            }

            if (
                SEARCH_OPERATORS.has(node.operator) &&
                !searchableFields.has(node.field)
            ) {
                throw new Error(
                    `Field not searchable: ${node.field}`
                );
            }

            // -----------------------------
            // Operator value validation
            // -----------------------------

            switch (node.operator) {

                case "in":
                case "nin":

                    if (!Array.isArray(node.value)) {
                        throw new Error(
                            `${node.operator} operator expects an array`
                        );
                    }

                    break;

                case "exists":

                    if (typeof node.value !== "boolean") {
                        throw new Error(
                            "exists operator expects a boolean"
                        );
                    }

                    break;

                case "contains":
                case "startsWith":
                case "endsWith":

                    if (
                        typeof node.value !== "string" ||
                        !node.value.trim()
                    ) {
                        throw new Error(
                            `${node.operator} operator expects a non-empty string`
                        );
                    }

                    break;

                case "gt":
                case "gte":
                case "lt":
                case "lte":

                    if (
                        node.value === null ||
                        node.value === undefined
                    ) {
                        throw new Error(
                            `${node.operator} operator requires a value`
                        );
                    }

                    break;
            }

        };

        validateNode(query);

        const mongoQuery =
            buildMongoQuery(query);


        const projection =
            safeSelectFields.length
                ? safeSelectFields.join(" ")
                : allowedFields.join(" ");

        const safeSortField =
            sortableFields.has(sortField)
                ? sortField
                : "createdAt";

        const sort = {

            [safeSortField]:
                sortOrder === "asc"
                    ? 1
                    : -1

        };

        pageNumber =
            Math.max(
                1,
                Number(pageNumber) || 1
            );

        pageSize = Math.min(
            MAX_PAGE_SIZE,
            Math.max(1, Number(pageSize) || 10)
        );

        const skip =
            (pageNumber - 1) * pageSize;

        const [

            data,

            totalCount

        ] = await Promise.all([

            model
                .find(mongoQuery)
                .select(projection)
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .lean(),

            model.countDocuments(
                mongoQuery
            )

        ]);

        return {

            success: true,

            data,

            pagination: {

                totalCount,

                pageNumber,

                pageSize,

                totalPages:
                    Math.ceil(
                        totalCount / pageSize
                    )

            }

        };

    } catch (error) {

        const message =
            error?.message || "";

        if (
            BAD_REQUEST_ERROR_PREFIXES.some(prefix =>
                message.startsWith(prefix)
            ) ||
            message.endsWith("operator requires a value")
        ) {
            return {
                success: false,
                errorCode: BAD_REQUEST,
                message
            };
        }

        return {

            success: false,

            errorCode: INTERNAL_ERROR,

            message

        };

    }

};

module.exports = {

    queryEngineService

};