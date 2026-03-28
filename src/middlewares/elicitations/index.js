// middlewares/elicitations/index.js

const { fetchElicitationMiddleware } = require("./fetch-elicitation.middleware");
const { fetchLatestElicitationMiddleware } = require("./fetch-latest-elicitation.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const elicitationMiddlewares = {
  fetchElicitationMiddleware,
  fetchLatestElicitationMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares
};

module.exports = { elicitationMiddlewares };
