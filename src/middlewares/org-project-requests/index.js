// middlewares/org-project-requests/index.js

const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { fetchOrgProjectRequestMiddleware } = require("./fetch-org-project-request.middleware");

module.exports = {
  orgProjectRequestValidationMiddlewares: validationMiddlewares,
  presenceMiddlewares,
  fetchOrgProjectRequestMiddleware
};
