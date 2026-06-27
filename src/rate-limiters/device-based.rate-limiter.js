const { createRedisDeviceRateLimiter } = require("./create-redis-device.rate-limiter");
const { perDevice } = require("../configs/rate-limit.config")

// middlewares/rateLimit_malformedAndWrongRequest.js
const malformedAndWrongRequestRateLimiter = createRedisDeviceRateLimiter(perDevice.malformedRequest);

// middlewares/rateLimit_unknownRoute.js
const unknownRouteLimiter = createRedisDeviceRateLimiter(perDevice.unknownRoute);

const duplicateQueryParameterRateLimiter = createRedisDeviceRateLimiter(perDevice.duplicateQueryParameter);

const deviceBasedRateLimiters = {
    malformedAndWrongRequestRateLimiter,
    unknownRouteLimiter,
    duplicateQueryParameterRateLimiter
};

module.exports = {
    deviceBasedRateLimiters
};