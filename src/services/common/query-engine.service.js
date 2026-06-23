// services/common/query-engine.service.js

const { INTERNAL_ERROR, BAD_REQUEST } = require("@/configs/http-status.config");

const SYSTEM_HIDDEN_FIELDS = Object.freeze([
    "__v"
]);

const buildCondition = ({
    field,
    operator,
    value
}) => {

    switch (operator) {

        case "eq":
            return { [field]: value };

        case "ne":
            return { [field]: { $ne: value } };

        case "gt":
            return { [field]: { $gt: value } };

        case "gte":
            return { [field]: { $gte: value } };

        case "lt":
            return { [field]: { $lt: value } };

        case "lte":
            return { [field]: { $lte: value } };

        case "in":
            return { [field]: { $in: value } };

        case "nin":
            return { [field]: { $nin: value } };

        case "exists":
            return { [field]: { $exists: value } };

        case "contains":
            return {
                [field]: {
                    $regex: value,
                    $options: "i"
                }
            };

        case "startsWith":
            return {
                [field]: {
                    $regex: `^${value}`,
                    $options: "i"
                }
            };

        case "endsWith":
            return {
                [field]: {
                    $regex: `${value}$`,
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
            $and: node.and.map(
                buildMongoQuery
            )
        };
    }

    if (node.or) {
        return {
            $or: node.or.map(
                buildMongoQuery
            )
        };
    }

    return buildCondition(node);
};

const queryEngineService = async ({
    model,

    hiddenFields = [],

    query = {},

    selectFields = [],

    pageNumber = 1,

    pageSize = 10,

    sortField = "createdAt",

    sortOrder = "desc"
}) => {
    try {
        const schemaFields =
            Object.keys(model.schema.paths);

        const finalHiddenFields = [
            ...SYSTEM_HIDDEN_FIELDS,
            ...hiddenFields
        ];

        const allowedFields =
            schemaFields.filter(
                field =>
                    !finalHiddenFields.includes(field)
            );

        const validateNode = (node) => {

            if (!node) return;

            if (node.and) {
                node.and.forEach(
                    validateNode
                );
                return;
            }

            if (node.or) {
                node.or.forEach(
                    validateNode
                );
                return;
            }

            if (
                !allowedFields.includes(
                    node.field
                )
            ) {
                throw new Error(
                    `Field not allowed: ${node.field}`
                );
            }
        };

        validateNode(query);

        const mongoQuery =
            buildMongoQuery(query);

        const safeSelectFields =
            (selectFields || []).filter(
                field =>
                    allowedFields.includes(field)
            );

        const projection =
            safeSelectFields.length
                ? safeSelectFields.join(" ")
                : allowedFields.join(" ");

        const safeSortField =
            allowedFields.includes(sortField)
                ? sortField
                : "createdAt";

        const sort = {
            [safeSortField]:
                sortOrder === "asc"
                    ? 1
                    : -1
        };

        pageNumber = Math.max(
            1,
            Number(pageNumber) || 1
        );

        pageSize = Math.max(
            1,
            Number(pageSize) || 10
        );

        const skip =
            (pageNumber - 1) * pageSize;

        const [data, totalCount] =
            await Promise.all([

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

        const message = error?.message || "";

        if (
            message.startsWith("Field not allowed") ||
            message.startsWith("Unsupported operator")
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
