const { activeProjectGuardMiddleware } = require("./active-project-guard.middleware");
const { fetchProjectMiddleware } = require("./fetch-project.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const projectMiddlewares = {
    activeProjectGuardMiddleware,
    fetchProjectMiddleware,
    ...validationMiddlewares,
    ...presenceMiddlewares
}

module.exports = { 
    projectMiddlewares
};