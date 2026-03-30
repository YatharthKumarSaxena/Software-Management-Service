// middlewares/negotiations/fetch-negotiation.middleware.js

const { NegotiationModel } = require("@models/negotiation.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * fetchNegotiationMiddleware
 * Fetches a negotiation by ID and attaches it to req.negotiation
 */
const fetchNegotiationMiddleware = async (req, res, next) => {
  try {
    const negotiationId = req?.params?.negotiationId;

    if (!negotiationId) {
      logMiddlewareError("fetchNegotiationMiddleware", "negotiationId is missing", req);
      return throwBadRequestError(res, "negotiationId is required");
    }

    if (!isValidMongoID(negotiationId)) {
      logMiddlewareError("fetchNegotiationMiddleware", `Invalid MongoDB ID: ${negotiationId}`, req);
      return throwBadRequestError(res, "Invalid negotiationId format");
    }

    const negotiation = await NegotiationModel.findById(negotiationId).lean();

    if (!negotiation) {
      logMiddlewareError("fetchNegotiationMiddleware", `Negotiation not found: ${negotiationId}`, req);
      return throwDBResourceNotFoundError(res, "Negotiation", negotiationId);
    }

    if (negotiation.isDeleted) {
      logMiddlewareError("fetchNegotiationMiddleware", `Negotiation is deleted: ${negotiationId}`, req);
      return throwBadRequestError(res, "Negotiation is deleted");
    }

    req.negotiation = negotiation;
    req.projectId = negotiation.projectId; // Attach projectId for downstream middlewares
    logWithTime(`✅ [fetchNegotiationMiddleware] Negotiation fetched: ${negotiationId}`);
    return next();
  } catch (error) {
    logMiddlewareError("fetchNegotiationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Negotiation", req?.params?.negotiationId);
  }
};

module.exports = { fetchNegotiationMiddleware };
