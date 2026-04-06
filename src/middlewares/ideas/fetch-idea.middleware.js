// middlewares/high-level-features/fetch-idea.middleware.js

const { IdeaModel } = require("@models/idea.model");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwDBResourceNotFoundError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { isValidMongoID } = require("@/utils/id-validators.util");

const fetchIdeaMiddleware = async (req, res, next) => {
  try {
    const ideaId = req?.params?.ideaId;

    if (!ideaId) {
      logMiddlewareError("fetchIdea", "No ideaId provided in params", req);
      return throwDBResourceNotFoundError(res, "Idea");
    }

    if (!isValidMongoID(ideaId)) {
      logMiddlewareError("fetchIdea", `Invalid ideaId format: ${ideaId}`, req);
      return throwDBResourceNotFoundError(res, `Idea with ID ${ideaId}`);
    }

    // Fetch Idea
    const idea = await IdeaModel.findOne({
      _id: ideaId,
      isDeleted: false
    });

    if (!idea) {
      logMiddlewareError("fetchIdea", `Idea ${ideaId} not found or is deleted`, req);
      return throwDBResourceNotFoundError(res, `Idea with ID ${ideaId}`);
    }

    // Attach to request
    req.idea = idea;

    logWithTime(`✅ Idea ${ideaId} fetched successfully`);
    return next();
  } catch (err) {
    logMiddlewareError("fetchIdea", `Unexpected error: ${err.message}`, req);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
  fetchIdeaMiddleware
};
