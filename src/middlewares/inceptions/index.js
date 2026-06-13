// middlewares/inceptions/index.js

const { fetchInceptionMiddleware, fetchLatestAnyStatusInceptionMiddleware, fetchLatestOpenInceptionMiddleware, fetchLatestNotFrozenInceptionMiddleware } = require("./fetch-inception.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const inceptionMiddlewares = {
    fetchInceptionMiddleware,
    fetchLatestAnyStatusInceptionMiddleware,
    fetchLatestOpenInceptionMiddleware,
    fetchLatestNotFrozenInceptionMiddleware,
    ...validationMiddlewares,
    ...presenceMiddlewares
}

module.exports = {
    inceptionMiddlewares
};
