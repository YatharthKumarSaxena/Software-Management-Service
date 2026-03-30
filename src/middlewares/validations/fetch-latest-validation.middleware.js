// middlewares/validations/fetch-latest-validation.middleware.js

const { ValidationModel } = require("@models/validation.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const fetchLatestValidationMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      logMiddlewareError("fetchLatestValidationMiddleware", "projectId is missing", req);
      return throwBadRequestError(res, "projectId is required");
    }
    if (!isValidMongoID(projectId)) {
      logMiddlewareError("fetchLatestValidationMiddleware", `Invalid MongoDB ID: ${projectId}`, req);
      return throwBadRequestError(res, "Invalid projectId format");
    }
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false
    })
      .sort({ "version.major": -1, "version.minor": -1 })
      .lean();
    if (!validation) {
      logMiddlewareError("fetchLatestValidationMiddleware", `No validation found for project: ${projectId}`, req);
      return throwDBResourceNotFoundError(res, "Validation", projectId);
    }
    req.validation = validation;
    logWithTime(`✅ [fetchLatestValidationMiddleware] Validation fetched: ${projectId}`);
    return next();
  } catch (error) {
    logMiddlewareError("fetchLatestValidationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Validation", req?.params?.projectId);
  }
};

module.exports = { fetchLatestValidationMiddleware };
