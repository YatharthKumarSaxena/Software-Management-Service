// middlewares/inceptions/index.js

const { fetchInceptionMiddleware } = require("./fetch-inception.middleware");
const { fetchLatestInceptionMiddleware } = require("./fetch-latest-inception.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const inceptionMiddlewares = {
    fetchInceptionMiddleware,
    fetchLatestInceptionMiddleware,
    ...validationMiddlewares,
    ...presenceMiddlewares
}

module.exports = { 
    inceptionMiddlewares
};
