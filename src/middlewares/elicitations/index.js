// middlewares/elicitations/index.js

const { fetchElicitationMiddleware, fetchLatestElicitationMiddleware, fetchLatestFrozenElicitationMiddleware } = require("./fetch-elicitation.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const elicitationMiddlewares = {
  fetchElicitationMiddleware,
  fetchLatestElicitationMiddleware,
  fetchLatestFrozenElicitationMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares
};

module.exports = { elicitationMiddlewares };
