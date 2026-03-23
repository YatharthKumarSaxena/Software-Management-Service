// middlewares/scopes/fetch-inception-from-project.middleware.js

const { InceptionModel } = require("@models/inception.model");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwDBResourceNotFoundError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Fetches the inception document for the project's current phase.
 * Requires req.project to be already set by fetchProjectMiddleware.
 * Attaches req.inception to the request.
 */
const fetchInceptionFromProjectMiddleware = async (req, res, next) => {
  try {
    const project = req?.project;

    if (!project) {
      logMiddlewareError("fetchInceptionFromProject", "No project found in request", req);
      return throwInternalServerError(res, new Error("Missing project in request context"));
    }

    // Fetch inception for the project's current phase
const inception = await InceptionModel.findOne({
  projectId: project._id,
  isDeleted: false
}).sort({ cycleNumber: -1 });

    if (!inception) {
      logMiddlewareError("fetchInceptionFromProject", `No inception found for project ${project._id}`, req);
      return throwDBResourceNotFoundError(res, `Inception for project ${project._id}`);
    }

    req.inception = inception;

    logWithTime(`✅ Inception ${inception._id} fetched for project ${project._id}`);
    return next();
  } catch (err) {
    logMiddlewareError("fetchInceptionFromProject", `Unexpected error: ${err.message}`, req);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
  fetchInceptionFromProjectMiddleware
};
