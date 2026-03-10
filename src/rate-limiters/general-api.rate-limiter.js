// middlewares/rate-limiters/apiRateLimiters.js
const { createRateLimiter } = require("./create.rate-limiter");
const { perUserAndDevice } = require("@configs/rate-limit.config");


const welcomeAdminRateLimiter = createRateLimiter(perUserAndDevice.welcomeAdmin);
const welcomeClientRateLimiter = createRateLimiter(perUserAndDevice.welcomeClient);

const createProjectRateLimiter   = createRateLimiter(perUserAndDevice.createProject);
const updateProjectRateLimiter   = createRateLimiter(perUserAndDevice.updateProject);
const abortProjectRateLimiter    = createRateLimiter(perUserAndDevice.abortProject);
const completeProjectRateLimiter = createRateLimiter(perUserAndDevice.completeProject);
const resumeProjectRateLimiter   = createRateLimiter(perUserAndDevice.resumeProject);
const deleteProjectRateLimiter   = createRateLimiter(perUserAndDevice.deleteProject);
const archiveProjectRateLimiter  = createRateLimiter(perUserAndDevice.archiveProject);
const getProjectRateLimiter      = createRateLimiter(perUserAndDevice.getProject);
const getProjectsRateLimiter     = createRateLimiter(perUserAndDevice.getProjects);

module.exports = {
    welcomeAdminRateLimiter,
    welcomeClientRateLimiter,
    createProjectRateLimiter,
    updateProjectRateLimiter,
    abortProjectRateLimiter,
    completeProjectRateLimiter,
    resumeProjectRateLimiter,
    deleteProjectRateLimiter,
    archiveProjectRateLimiter,
    getProjectRateLimiter,
    getProjectsRateLimiter,
}