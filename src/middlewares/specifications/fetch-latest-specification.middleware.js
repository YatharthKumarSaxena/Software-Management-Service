// middlewares/specifications/fetch-latest-specification.middleware.js

const { SpecificationModel } = require("@models/specification.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const fetchLatestSpecificationMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      logMiddlewareError("fetchLatestSpecificationMiddleware", "projectId is missing", req);
      return throwBadRequestError(res, "projectId is required");
    }
    if (!isValidMongoID(projectId)) {
      logMiddlewareError("fetchLatestSpecificationMiddleware", `Invalid MongoDB ID: ${projectId}`, req);
      return throwBadRequestError(res, "Invalid projectId format");
    }
    const specification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false // Ensure we only delete if not frozen
    })
      .sort({ "version.major": -1, "version.minor": -1 })
      .lean();
    if (!specification) {
      logMiddlewareError("fetchLatestSpecificationMiddleware", `No specification found for project: ${projectId}`, req);
      return throwDBResourceNotFoundError(res, "Specification", projectId);
    }
    req.specification = specification;
    logWithTime(`✅ [fetchLatestSpecificationMiddleware] Specification fetched: ${projectId}`);
    return next();
  } catch (error) {
    logMiddlewareError("fetchLatestSpecificationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Specification", req?.params?.projectId);
  }
};

module.exports = { fetchLatestSpecificationMiddleware };
