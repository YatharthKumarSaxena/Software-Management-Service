// middlewares/elicitations/index.js

const { fetchElicitationMiddleware, fetchLatestAnyStatusElicitationMiddleware, fetchLatestOpenElicitationMiddleware, fetchLatestNotFrozenElicitationMiddleware } = require("./fetch-elicitation.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const elicitationMiddlewares = {
  fetchElicitationMiddleware,
  fetchLatestAnyStatusElicitationMiddleware,
  fetchLatestOpenElicitationMiddleware,
  fetchLatestNotFrozenElicitationMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares
};

module.exports = { elicitationMiddlewares };
