// middlewares/inceptions/index.js

const { fetchInceptionMiddleware, fetchLatestAnyStatusInceptionMiddleware, fetchLatestOpenInceptionMiddleware, fetchLatestNotFrozenInceptionMiddleware } = require("./fetch-inception.middleware");

const inceptionMiddlewares = {
    fetchInceptionMiddleware,
    fetchLatestAnyStatusInceptionMiddleware,
    fetchLatestOpenInceptionMiddleware,
    fetchLatestNotFrozenInceptionMiddleware
}

module.exports = {
    inceptionMiddlewares
};
