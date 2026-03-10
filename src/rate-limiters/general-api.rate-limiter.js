// middlewares/rate-limiters/apiRateLimiters.js
const { createRateLimiter } = require("./create.rate-limiter");
const { perUserAndDevice } = require("@configs/rate-limit.config");


const welcomeAdminRateLimiter = createRateLimiter(perUserAndDevice.welcomeAdmin);
const welcomeClientRateLimiter = createRateLimiter(perUserAndDevice.welcomeClient);

const createProjectRateLimiter = createRateLimiter(perUserAndDevice.createProject);
const updateProjectRateLimiter = createRateLimiter(perUserAndDevice.updateProject);

module.exports = {
    welcomeAdminRateLimiter,
    welcomeClientRateLimiter,
    createProjectRateLimiter,
    updateProjectRateLimiter,
}