const express = require("express");
const elicitationRouter = express.Router();

const { ELICITATION_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { projectMiddlewares } = require("@/middlewares/projects");
const { elicitationMiddlewares } = require("@/middlewares/elicitations");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { elicitationControllers } = require("@controllers/elicitations");

const {
	CREATE_ELICITATION,
	DELETE_ELICITATION,
	GET_ELICITATION,
	LIST_ELICITATIONS,
} = ELICITATION_ROUTES;

elicitationRouter.post(
	CREATE_ELICITATION,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		checkUserIsStakeholder,
	],
	elicitationControllers.createElicitationController
);

elicitationRouter.delete(
	DELETE_ELICITATION,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		elicitationMiddlewares.fetchElicitationMiddleware,
		checkUserIsStakeholder,
	],
	elicitationControllers.deleteElicitationController
);

elicitationRouter.get(
	GET_ELICITATION,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		elicitationMiddlewares.fetchElicitationMiddleware,
		checkUserIsStakeholder,
	],
	elicitationControllers.getElicitationController
);

elicitationRouter.get(
	LIST_ELICITATIONS,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		checkUserIsStakeholder,
	],
	elicitationControllers.listElicitationsController
);

module.exports = {
	elicitationRouter,
};

