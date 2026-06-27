// routes/phase.routes.js

const express = require("express");
const phaseRouter = express.Router();

const { PHASE_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const {
  createPhaseRateLimiter,
  updatePhaseStatusRateLimiter,
  updatePhaseSettingsRateLimiter,
  deletePhaseRateLimiter,
  getPhaseRateLimiter,
  getLatestPhaseRateLimiter,
  listPhasesRateLimiter
} = require("@rate-limiters/general-api.rate-limiter");

const { phaseControllers } = require("@controllers/phases");
const { phaseMiddlewares } = require("@middlewares/phases");
const { projectMiddlewares } = require("@/middlewares/projects");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { getDataMiddleware, listDataMiddleware } = require("@middlewares/common/fetch-data.middleware");
const { stakeholderRoleAccessMiddlewares } = require("@/middlewares/stakeholders/api-stakeholder-role-access.middleware");

const {
  CREATE_PHASE,
  UPDATE_PHASE_SETTING,
  UPDATE_PHASE_STATUS,
  DELETE_PHASE,
  GET_PHASE,
  GET_LATEST_PHASE,
  LIST_PHASES
} = PHASE_ROUTES;

phaseRouter.post(
  CREATE_PHASE,
  [
    ...baseAuthAdminMiddlewares,
    createPhaseRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.createPhaseStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    phaseMiddlewares.createPhasePresenceMiddleware,
    phaseMiddlewares.createPhaseValidationMiddleware
  ],
  phaseControllers.createPhaseController
);

phaseRouter.patch(
  UPDATE_PHASE_STATUS,
  [
    ...baseAuthAdminMiddlewares,
    updatePhaseStatusRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updatePhaseStatusStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    phaseMiddlewares.updatePhaseStatusPresenceMiddleware,
    phaseMiddlewares.updatePhaseStatusValidationMiddleware
  ],
  phaseControllers.updatePhaseStatusController
);


phaseRouter.patch(
  UPDATE_PHASE_SETTING,
  [
    ...baseAuthAdminMiddlewares,
    updatePhaseSettingsRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.updatePhaseSettingsStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    phaseMiddlewares.fetchLatestPhaseMiddleware,
    phaseMiddlewares.updatePhaseSettingsPresenceMiddleware,
    phaseMiddlewares.updatePhaseSettingsValidationMiddleware
  ],
  phaseControllers.updatePhaseSettingsController
);

phaseRouter.delete(
  DELETE_PHASE,
  [
    ...baseAuthAdminMiddlewares,
    deletePhaseRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    stakeholderRoleAccessMiddlewares.deletePhaseStakeholderRoleAccessMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    phaseMiddlewares.fetchLatestPhaseMiddleware,
    phaseMiddlewares.deletePhasePresenceMiddleware,
    phaseMiddlewares.deletePhaseValidationMiddleware
  ],
  phaseControllers.deletePhaseController
);

phaseRouter.get(
  GET_PHASE,
  [
    ...baseAuthAdminMiddlewares,
    getPhaseRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    phaseMiddlewares.fetchPhaseMiddleware
  ],
  phaseControllers.getPhaseController
);

phaseRouter.get(
  GET_LATEST_PHASE,
  [
    ...baseAuthAdminMiddlewares,
    getLatestPhaseRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder,
    phaseMiddlewares.fetchLatestPhaseMiddleware
  ],
  phaseControllers.getLatestPhaseController
);

phaseRouter.get(
  LIST_PHASES,
  [
    ...baseAuthAdminMiddlewares,
    listPhasesRateLimiter,
    listDataMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    checkUserIsStakeholder
  ],
  phaseControllers.listPhaseController
);

module.exports = {
    phaseRouter
}