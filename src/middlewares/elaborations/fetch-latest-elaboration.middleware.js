// middlewares/elaborations/fetch-latest-elaboration.middleware.js

const { ElaborationModel } = require("@models/elaboration.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const fetchLatestElaborationMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      logMiddlewareError("fetchLatestElaborationMiddleware", "projectId is missing", req);
      return throwBadRequestError(res, "projectId is required");
    }
    if (!isValidMongoID(projectId)) {
      logMiddlewareError("fetchLatestElaborationMiddleware", `Invalid MongoDB ID: ${projectId}`, req);
      return throwBadRequestError(res, "Invalid projectId format");
    }
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false
    })
      .sort({ "version.major": -1, "version.minor": -1 })
      .lean();
    if (!elaboration) {
      logMiddlewareError("fetchLatestElaborationMiddleware", `No elaboration found for project: ${projectId}`, req);
      return throwDBResourceNotFoundError(res, "Elaboration", projectId);
    }
    req.elaboration = elaboration;
    logWithTime(`✅ [fetchLatestElaborationMiddleware] Elaboration fetched: ${projectId}`);
    return next();
  } catch (error) {
    logMiddlewareError("fetchLatestElaborationMiddleware", error.message, req);
    return throwDBResourceNotFoundError(res, "Elaboration", req?.params?.projectId);
  }
};

module.exports = { fetchLatestElaborationMiddleware };
