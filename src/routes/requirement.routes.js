// routes/admin.routes.js

const express = require("express");
const requirementRouter = express.Router();

const { REQUIREMENT_ROUTES } = require("@/configs/uri.config");
const { baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");

const { requirementControllers } = require("@controllers/requirements");
const { requirementMiddlewares } = require("@/middlewares/requirements");
const { createRequirementRateLimiter, getRequirementRateLimiter, listRequirementsRateLimiter } = require("@/rate-limiters/general-api.rate-limiter");
const { projectMiddlewares } = require("@/middlewares/projects");
const { commonMiddlewares } = require("@/middlewares/common");

const {
  CREATE_REQUIREMENT,
  GET_REQUIREMENT,
  LIST_REQUIREMENTS
} = REQUIREMENT_ROUTES;

// Create Requirement
requirementRouter.post(
  CREATE_REQUIREMENT,
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

// Get Requirement
requirementRouter.get(
  GET_REQUIREMENT,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getRequirementRateLimiter,
    requirementMiddlewares.fetchRequirementMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
  ],
  requirementControllers.getRequirementController
);

requirementRouter.get(
  LIST_REQUIREMENTS,
  [
    ...baseAuthClientOrAdminMiddlewares,
    listRequirementsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
  ],
  requirementControllers.listRequirementsController
);

module.exports = {
  requirementRouter
};