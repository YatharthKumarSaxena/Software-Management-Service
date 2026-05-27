// middlewares/high-level-features/fetch-hlf.middleware.js

const { HighLevelFeatureModel } = require("@models/high-level-feature.model");
const { ProjectModel } = require("@models/project.model");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwDBResourceNotFoundError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { isValidMongoID } = require("@/utils/id-validators.util");

const fetchHlfMiddleware = async (req, res, next) => {
  try {
    const hlfId = req?.params?.hlfId;

    if (!hlfId) {
      logMiddlewareError("fetchHlf", "No hlfId provided in params", req);
      return throwDBResourceNotFoundError(res, "High-level feature");
    }

    if (!isValidMongoID(hlfId)) {
      logMiddlewareError("fetchHlf", `Invalid hlfId format: ${hlfId}`, req);
      return throwDBResourceNotFoundError(res, `High-level feature with ID ${hlfId}`);
    }

    // Fetch HLF
    const hlf = await HighLevelFeatureModel.findOne({
      _id: hlfId,
      isDeleted: false
    });

    if (!hlf) {
      logMiddlewareError("fetchHlf", `HLF ${hlfId} not found or is deleted`, req);
      return throwDBResourceNotFoundError(res, `High-level feature with ID ${hlfId}`);
    }

    // Fetch associated project
    const project = await ProjectModel.findOne({
      _id: hlf.projectId,
      isDeleted: false
    });

    if (!project) {
      logMiddlewareError("fetchHlf", `Project ${hlf.projectId} not found for HLF ${hlfId}`, req);
      return throwDBResourceNotFoundError(res, `Associated Project for HLF ${hlfId}`);
    }

    // Attach to request
    req.hlf = hlf;
    req.project = project;

    logWithTime(`✅ HLF ${hlfId} fetched successfully with associated project`);
    return next();
  } catch (err) {
    logMiddlewareError("fetchHlf", `Unexpected error: ${err.message}`, req);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
  fetchHlfMiddleware
};
