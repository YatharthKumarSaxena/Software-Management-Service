// middlewares/negotiations/fetch-latest-negotiation.middleware.js

const { NegotiationModel } = require("@models/negotiation.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * fetchLatestNegotiationMiddleware
 * Fetches the latest (by version) negotiation for a project and attaches it to req.negotiation
 */
const fetchLatestNegotiationMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      logMiddlewareError("fetchLatestNegotiationMiddleware", "projectId is missing", req);
      return throwBadRequestError(res, "projectId is required");
    }

    if (!isValidMongoID(projectId)) {
      logMiddlewareError("fetchLatestNegotiationMiddleware", `Invalid MongoDB ID: ${projectId}`, req);
      return throwBadRequestError(res, "Invalid projectId format");
    }

    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false
    })
      .sort({ "version.major": -1, "version.minor": -1 })
      .lean();

    if (!negotiation) {
      logMiddlewareError("fetchLatestNegotiationMiddleware", `No negotiation found for project: ${projectId}`, req);
      return throwDBResourceNotFoundError(res, "Negotiation", projectId);
    }

    req.negotiation = negotiation;
    logWithTime(`✅ [fetchLatestNegotiationMiddleware] Negotiation fetched: ${projectId}`);
    return next();
  } catch (error) {
    logMiddlewareError("fetchLatestNegotiationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Negotiation", req?.params?.projectId);
  }
};

module.exports = { fetchLatestNegotiationMiddleware };
