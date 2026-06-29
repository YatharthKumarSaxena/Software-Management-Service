// routes/admin.routes.js

const express = require("express");
const requirementRouter = express.Router();

const { REQUIREMENT_ROUTES } = require("@/configs/uri.config");
const { baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");

const { requirementControllers } = require("@controllers/requirements");
const { requirementMiddlewares } = require("@/middlewares/requirements");
const { createRequirementRateLimiter, getRequirementRateLimiter, listRequirementsRateLimiter, createRequirementInBulkRateLimiter } = require("@/rate-limiters/general-api.rate-limiter");
const { projectMiddlewares } = require("@/middlewares/projects");
const { commonMiddlewares } = require("@/middlewares/common");
const { getDataMiddleware, listDataMiddleware } = require("@middlewares/common/fetch-data.middleware");
const { bulkImportMiddlewares } = require("@middlewares/bulk-import");
const { elicitationMiddlewares } = require("@/middlewares/elicitations");
const { checkRequirementFileUploadConfiguration, parseSpreadsheetFileMiddleware, createRequirementInBulkHeaderValidationMiddleware } = bulkImportMiddlewares; 

const {
  CREATE_REQUIREMENT,
  GET_REQUIREMENT,
  LIST_REQUIREMENTS,
  CREATE_REQUIREMENT_IN_BULK
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
    getDataMiddleware,
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
    listDataMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
  ],
  requirementControllers.listRequirementsController
);


requirementRouter.post(
  CREATE_REQUIREMENT_IN_BULK,
  [
    ...baseAuthClientOrAdminMiddlewares,
    createRequirementInBulkRateLimiter,

    // Project resolution & guards
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Elicitation-only guard (bulk import is forbidden in Elaboration)
    elicitationMiddlewares.fetchLatestOpenElicitationMiddleware,

    // File configuration middleware
    checkRequirementFileUploadConfiguration,

    // Parse Excel/CSV
    parseSpreadsheetFileMiddleware,

    // Header validation
    createRequirementInBulkHeaderValidationMiddleware

  ],
  requirementControllers.bulkCreateRequirementController
);

module.exports = {
  requirementRouter
};