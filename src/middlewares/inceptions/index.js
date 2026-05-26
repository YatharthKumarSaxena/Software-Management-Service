// middlewares/inceptions/index.js

const { fetchInceptionMiddleware, fetchLatestFrozenInceptionMiddleware, fetchLatestInceptionMiddleware } = require("./fetch-inception.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const inceptionMiddlewares = {
    fetchInceptionMiddleware,
    fetchLatestInceptionMiddleware,
    fetchLatestFrozenInceptionMiddleware,
    ...validationMiddlewares,
    ...presenceMiddlewares
}

module.exports = { 
    inceptionMiddlewares
};
