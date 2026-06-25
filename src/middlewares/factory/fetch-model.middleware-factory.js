// middlewares/factory/fetch-model.middleware-factory.js

const { isValidMongoID } = require("@utils/id-validators.util");

const {
    throwBadRequestError,
    throwDBResourceNotFoundError,
    throwInternalServerError,
    logMiddlewareError
} = require("@/responses/common/error-handler.response");

const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Factory to create generic fetch middleware.
 *
 * @param {Object} options
 * @param {mongoose.Model} options.model
 * @param {string} options.modelName
 * @param {string} options.idParamName
 * @param {string} options.requestKey
 * @param {Object} [options.additionalQuery={}]
 * @param {Array<{source:string,target:string}>} [options.attachFields=[]]
 * @param {boolean} [options.useLean=true]
 *
 * @returns {Function}
 */
const createFetchModelMiddleware = ({
    model,
    modelName,
    idParamName,
    requestKey,

    additionalQuery = {},
    attachFields = [],

    useLean = true
}) => {

    if (!model) {
        throw new Error("model is required");
    }

    if (!modelName) {
        throw new Error("modelName is required");
    }

    if (!idParamName) {
        throw new Error("idParamName is required");
    }

    if (!requestKey) {
        throw new Error("requestKey is required");
    }

    return async (req, res, next) => {
        try {

            const resourceId = req?.params?.[idParamName];

            // ── ID Required ─────────────────────────────────────
            if (!resourceId) {
                logMiddlewareError(
                    "createFetchModelMiddleware",
                    `${idParamName} is missing`,
                    req
                );

                return throwBadRequestError(
                    res,
                    `${idParamName} is required`
                );
            }

            // ── Mongo ID Validation ─────────────────────────────
            if (!isValidMongoID(resourceId)) {
                logMiddlewareError(
                    "createFetchModelMiddleware",
                    `Invalid MongoDB ID format: ${resourceId}`,
                    req
                );

                return throwBadRequestError(
                    res,
                    `Invalid ${idParamName} format`
                );
            }

            const query = {
                _id: resourceId,
                ...additionalQuery
            };

            let documentQuery = model.findOne(query);

            if (useLean) {
                documentQuery = documentQuery.lean();
            }

            const document = await documentQuery;

            // ── Resource Not Found ──────────────────────────────
            if (!document) {
                logMiddlewareError(
                    "createFetchModelMiddleware",
                    `${modelName} not found: ${resourceId}`,
                    req
                );

                return throwDBResourceNotFoundError(
                    res,
                    modelName,
                    resourceId
                );
            }

            // ── Attach Main Resource ────────────────────────────
            req[requestKey] = document;

            // ── Attach Additional Fields ────────────────────────
            for (const field of attachFields) {
                req[field.target] = document?.[field.source];
            }

            logWithTime(
                `✅ [createFetchModelMiddleware] ${modelName} fetched: ${resourceId}`
            );

            return next();

        } catch (error) {

            logMiddlewareError(
                "createFetchModelMiddleware",
                `Unexpected error: ${error.message}`,
                req
            );

            return throwInternalServerError(res, error);
        }
    };
};

module.exports = {
    createFetchModelMiddleware
};