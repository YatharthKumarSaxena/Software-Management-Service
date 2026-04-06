// middlewares/ideas/index.js

const { fetchIdeaMiddleware } = require("./fetch-idea.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const ideaMiddlewares = {
  fetchIdeaMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
};

module.exports = { ideaMiddlewares };
