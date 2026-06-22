const { fetchLatestPhaseMiddleware } = require("./fetch-latest-phase.middleware");
const { fetchPhaseMiddleware } = require("./fetch-phase.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const phaseMiddlewares = {
    fetchLatestPhaseMiddleware,
    fetchPhaseMiddleware,
    ...presenceMiddlewares,
    ...validationMiddlewares
};

module.exports = {
    phaseMiddlewares
};