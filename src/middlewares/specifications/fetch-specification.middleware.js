// middlewares/specifications/fetch-specification.middleware.js

const { SpecificationModel } = require("@models/specification.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const fetchSpecificationMiddleware = async (req, res, next) => {
  try {
    const specificationId = req?.params?.specificationId;
    if (!specificationId) {
      logMiddlewareError("fetchSpecificationMiddleware", "specificationId is missing", req);
      return throwBadRequestError(res, "specificationId is required");
    }
    if (!isValidMongoID(specificationId)) {
      logMiddlewareError("fetchSpecificationMiddleware", `Invalid MongoDB ID: ${specificationId}`, req);
      return throwBadRequestError(res, "Invalid specificationId format");
    }
    const specification = await SpecificationModel.findById(specificationId).lean();
    if (!specification) {
      logMiddlewareError("fetchSpecificationMiddleware", `Specification not found: ${specificationId}`, req);
      return throwDBResourceNotFoundError(res, "Specification", specificationId);
    }
    if (specification.isDeleted) {
      logMiddlewareError("fetchSpecificationMiddleware", `Specification is deleted: ${specificationId}`, req);
      return throwBadRequestError(res, "Specification is deleted");
    }
    req.specification = specification;
    logWithTime(`✅ [fetchSpecificationMiddleware] Specification fetched: ${specificationId}`);
    return next();
  } catch (error) {
    logMiddlewareError("fetchSpecificationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Specification", req?.params?.specificationId);
  }
};

module.exports = { fetchSpecificationMiddleware };
