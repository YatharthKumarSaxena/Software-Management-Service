// middlewares/factory/fetch-phase.middleware-factory.js

/**
 * Factory Middleware: Dynamic Phase Document Fetcher
 * 
 * This factory creates a reusable middleware that fetches any phase document by ID.
 * Instead of writing separate fetch middlewares for Elicitation, Inception, Specification, etc.,
 * this factory generates them dynamically using Phase enum and Model mapping.
 * 
 * PATTERN: [ID Presence Guard] → [Format Guard] → [DB Lookup] → [Soft-Delete Guard] → [Attach to Request]
 */

const mongoose = require("mongoose");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
    throwBadRequestError,
    throwDBResourceNotFoundError,
    throwInternalServerError,
    logMiddlewareError,
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { Phases } = require("@configs/enums.config");

/**
 * Creates a middleware that fetches a phase document by ID
 * 
 * @param {string} phaseEnum - Phase enum value from Phases config (e.g., "inceptions", "elicitations")
 * @param {string} paramName - Route parameter name (default: "elaborationId")
 *                             e.g., "elaborationId", "inceptionId", "specificationId"
 * @param {string} requestKey - Key to attach on req object (default: derived from phaseEnum)
 *                              e.g., "inception", "elicitation", "elaboration"
 * @returns {Function} - Express middleware function
 * 
 * @example
 * // Create middlewares for different phases
 * const fetchInceptionMiddleware = createFetchPhaseMiddleware("inceptions", "inceptionId", "inception");
 * const fetchElicitationMiddleware = createFetchPhaseMiddleware("elicitations", "elicitationId", "elicitation");
 * const fetchElaborationMiddleware = createFetchPhaseMiddleware("elaborations", "elaborationId", "elaboration");
 * 
 * @example
 * // Usage in routes
 * router.get("/:elaborationId", fetchElaborationMiddleware, controller);
 * // req.elaboration will contain the fetched document
 * // req.projectId will contain the document's projectId
 */
const createFetchPhaseMiddleware = (
    phaseEnum,
    paramName = "elaborationId",
    requestKey = null
) => {
    // Auto-derive request key from phase enum if not provided
    // "inceptions" → "inception", "elicitations" → "elicitation", etc.
    const derivedRequestKey = requestKey || phaseEnum.slice(0, -1); // Remove trailing 's'
    const validPhases = Object.values(Phases);

    if (!validPhases.includes(phaseEnum)) {
        throw new Error(
            `Invalid phaseEnum "${phaseEnum}". Allowed values: ${validPhases.join(", ")}`
        );
    }
    return async (req, res, next) => {
        try {
            const phaseName = derivedRequestKey.charAt(0).toUpperCase() + derivedRequestKey.slice(1);
            // ============================================
            // GUARD 1: Check if ID parameter exists
            // ============================================
            const phaseId = req?.params?.[paramName];

            if (!phaseId) {
                logMiddlewareError(
                    "fetchPhaseMiddleware",
                    `${paramName} is missing`,
                    req
                );
                return throwBadRequestError(res, `${paramName} is required`);
            }

            // ============================================
            // GUARD 2: Validate MongoDB ObjectId format
            // ============================================
            if (!isValidMongoID(phaseId)) {
                logMiddlewareError(
                    "fetchPhaseMiddleware",
                    `Invalid MongoDB ID format: ${phaseId}`,
                    req
                );
                return throwBadRequestError(res, `Invalid ${paramName} format`);
            }

            // ============================================
            // GUARD 3: Database lookup with lean()
            // ============================================
            const Model = mongoose.models[phaseEnum];
            const phaseDocument = await Model.findById(phaseId).lean();

            if (!phaseDocument) {
                logMiddlewareError(
                    "fetchPhaseMiddleware",
                    `Phase document not found: ${phaseId}`,
                    req
                );
                return throwDBResourceNotFoundError(res, phaseName, phaseId);
            }

            // ============================================
            // GUARD 4: Soft-delete check
            // ============================================
            if (phaseDocument.isDeleted === true) {
                logMiddlewareError(
                    "fetchPhaseMiddleware",
                    `Phase is deleted: ${phaseId}`,
                    req
                );
                return throwBadRequestError(res, `${phaseName} has been deleted`);
            }

            // ============================================
            // Attach to request & proceed
            // ============================================
            req[derivedRequestKey] = phaseDocument;
            req.projectId = phaseDocument.projectId.toString();

            logWithTime(
                `✅ [fetchPhaseMiddleware] ${phaseName} fetched: ${phaseId}`
            );

            return next();

        } catch (error) {
            logMiddlewareError("fetchPhaseMiddleware", error.message, req);
            return throwInternalServerError(res, error);
        }
    };
};

module.exports = { createFetchPhaseMiddleware };