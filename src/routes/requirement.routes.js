// routes/admin.routes.js

const express = require("express");
const requirementRouter = express.Router();

const { REQUIREMENT_ROUTES } = require("@/configs/uri.config");
const { baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");

const { requirementControllers } = require("@controllers/requirements");
const { requirementMiddlewares } = require("@/middlewares/requirements");
const { createRequirementRateLimiter } = require("@/rate-limiters/general-api.rate-limiter");
const { projectMiddlewares } = require("@/middlewares/projects");
const { commonMiddlewares } = require("@/middlewares/common");

// Create Requirement
requirementRouter.post(
  REQUIREMENT_ROUTES.CREATE_REQUIREMENT,
  [
    ...baseAuthClientOrAdminMiddlewares,
    createRequirementRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    requirementMiddlewares.createRequirementPhaseCheckMiddleware,
    requirementMiddlewares.createRequirementPresenceMiddleware,
    requirementMiddlewares.createRequirementValidationMiddleware
  ],
  requirementControllers.createRequirementController
);

module.exports = {
  requirementRouter
};