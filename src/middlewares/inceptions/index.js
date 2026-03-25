// middlewares/inceptions/index.js

const { fetchInceptionMiddleware } = require("./fetch-inception.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const inceptionMiddlewares = {
    fetchInceptionMiddleware,
    ...validationMiddlewares,
    ...presenceMiddlewares
}

module.exports = { 
    inceptionMiddlewares
};
