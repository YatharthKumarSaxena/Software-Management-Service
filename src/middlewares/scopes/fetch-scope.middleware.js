// middlewares/scopes/fetch-scope.middleware.js

const { ScopeModel } = require("@models/scope-model");
const { InceptionModel } = require("@models/inception.model");
const { ProjectModel } = require("@models/project.model");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwDBResourceNotFoundError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { isValidMongoID } = require("@/utils/id-validators.util");

const fetchScopeMiddleware = async (req, res, next) => {
  try {
    const scopeId = req?.params?.scopeId;

    if (!scopeId) {
      logMiddlewareError("fetchScope", "No scopeId provided in params", req);
      return throwDBResourceNotFoundError(res, "Scope");
    }

    if (!isValidMongoID(scopeId)) {
      logMiddlewareError("fetchScope", `Invalid scopeId format: ${scopeId}`, req);
      return throwDBResourceNotFoundError(res, `Scope with ID ${scopeId}`);
    }

    // Fetch scope
    const scope = await ScopeModel.findOne({
      _id: scopeId,
      isDeleted: false
    });

    if (!scope) {
      logMiddlewareError("fetchScope", `Scope ${scopeId} not found or is deleted`, req);
      return throwDBResourceNotFoundError(res, `Scope with ID ${scopeId}`);
    }

    // Fetch associated inception
    const inception = await InceptionModel.findOne({
      _id: scope.inceptionId,
      isDeleted: false
    });

    if (!inception) {
      logMiddlewareError("fetchScope", `Inception ${scope.inceptionId} not found for scope ${scopeId}`, req);
      return throwDBResourceNotFoundError(res, `Associated Inception for scope ${scopeId}`);
    }

    // Fetch associated project
    const project = await ProjectModel.findOne({
      _id: inception.projectId,
      isDeleted: false
    });

    if (!project) {
      logMiddlewareError("fetchScope", `Project ${inception.projectId} not found for inception ${inception._id}`, req);
      return throwDBResourceNotFoundError(res, `Associated Project for scope ${scopeId}`);
    }

    // Attach to request
    req.scope = scope;
    req.inception = inception;
    req.project = project;

    logWithTime(`✅ Scope ${scopeId} fetched successfully with associated inception and project`);
    return next();
  } catch (err) {
    logMiddlewareError("fetchScope", `Unexpected error: ${err.message}`, req);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
  fetchScopeMiddleware
};
