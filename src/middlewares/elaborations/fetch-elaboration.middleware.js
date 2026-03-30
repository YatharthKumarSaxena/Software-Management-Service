// middlewares/elaborations/fetch-elaboration.middleware.js

const { ElaborationModel } = require("@models/elaboration.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const fetchElaborationMiddleware = async (req, res, next) => {
  try {
    const elaborationId = req?.params?.elaborationId;
    if (!elaborationId) {
      logMiddlewareError("fetchElaborationMiddleware", "elaborationId is missing", req);
      return throwBadRequestError(res, "elaborationId is required");
    }
    if (!isValidMongoID(elaborationId)) {
      logMiddlewareError("fetchElaborationMiddleware", `Invalid MongoDB ID: ${elaborationId}`, req);
      return throwBadRequestError(res, "Invalid elaborationId format");
    }
    const elaboration = await ElaborationModel.findById(elaborationId).lean();
    if (!elaboration) {
      logMiddlewareError("fetchElaborationMiddleware", `Elaboration not found: ${elaborationId}`, req);
      return throwDBResourceNotFoundError(res, "Elaboration", elaborationId);
    }
    if (elaboration.isDeleted) {
      logMiddlewareError("fetchElaborationMiddleware", `Elaboration is deleted: ${elaborationId}`, req);
      return throwBadRequestError(res, "Elaboration is deleted");
    }
    req.elaboration = elaboration;
    req.projectId = elaboration.projectId; // Attach projectId for downstream middlewares
    logWithTime(`✅ [fetchElaborationMiddleware] Elaboration fetched: ${elaborationId}`);
    return next(); 
  } catch (error) {
    logMiddlewareError("fetchElaborationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Elaboration", req?.params?.elaborationId);
  }
};

module.exports = { fetchElaborationMiddleware };
