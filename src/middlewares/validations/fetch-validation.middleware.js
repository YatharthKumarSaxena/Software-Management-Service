// middlewares/validations/fetch-validation.middleware.js

const { ValidationModel } = require("@models/validation.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const fetchValidationMiddleware = async (req, res, next) => {
  try {
    const validationId = req?.params?.validationId;
    if (!validationId) {
      logMiddlewareError("fetchValidationMiddleware", "validationId is missing", req);
      return throwBadRequestError(res, "validationId is required");
    }
    if (!isValidMongoID(validationId)) {
      logMiddlewareError("fetchValidationMiddleware", `Invalid MongoDB ID: ${validationId}`, req);
      return throwBadRequestError(res, "Invalid validationId format");
    }
    const validation = await ValidationModel.findById(validationId).lean();
    if (!validation) {
      logMiddlewareError("fetchValidationMiddleware", `Validation not found: ${validationId}`, req);
      return throwDBResourceNotFoundError(res, "Validation", validationId);
    }
    if (validation.isDeleted) {
      logMiddlewareError("fetchValidationMiddleware", `Validation is deleted: ${validationId}`, req);
      return throwBadRequestError(res, "Validation is deleted");
    }
    req.validation = validation;
    req.projectId = validation.projectId; // Attach projectId for downstream middlewares
    logWithTime(`✅ [fetchValidationMiddleware] Validation fetched: ${validationId}`);
    return next();
  } catch (error) {
    logMiddlewareError("fetchValidationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Validation", req?.params?.validationId);
  }
};

module.exports = { fetchValidationMiddleware };
