const express = require("express");
const fastRouter = express.Router();

const { FAST_ROUTES } = require("@/configs/uri.config");
const {
	baseAuthAdminMiddlewares,
	baseAuthClientOrAdminMiddlewares,
} = require("./middleware.gateway.routes");
const { projectMiddlewares } = require("@/middlewares/projects");
const { fastMiddlewares } = require("@/middlewares/fast");
const { checkUserIsStakeholder } = require("@/middlewares/stakeholders/check-user-is-stakeholder.middleware");
const { fastControllers } = require("@controllers/fast");

const {
	CREATE_FAST,
	UPDATE_FAST,
	DELETE_FAST,
	GET_FAST,
	LIST_FASTS,
	ADD_FAST_MEMBER,
	REMOVE_FAST_MEMBER,
} = FAST_ROUTES;

fastRouter.post(
	CREATE_FAST,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		checkUserIsStakeholder,
	],
	fastControllers.createFastController
);

fastRouter.patch(
	UPDATE_FAST,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		fastMiddlewares.fetchFastMiddleware,
		checkUserIsStakeholder,
	],
	fastControllers.updateFastController
);

fastRouter.delete(
	DELETE_FAST,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		fastMiddlewares.fetchFastMiddleware,
		checkUserIsStakeholder,
	],
	fastControllers.deleteFastController
);

fastRouter.patch(
	ADD_FAST_MEMBER,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		fastMiddlewares.fetchFastMiddleware,
		checkUserIsStakeholder,
	],
	fastControllers.addFastMemberController
);

fastRouter.patch(
	REMOVE_FAST_MEMBER,
	[
		...baseAuthAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		fastMiddlewares.fetchFastMiddleware,
		checkUserIsStakeholder,
	],
	fastControllers.removeFastMemberController
);

fastRouter.get(
	GET_FAST,
	[
		...baseAuthClientOrAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		fastMiddlewares.fetchFastMiddleware,
		checkUserIsStakeholder,
	],
	fastControllers.getFastController
);

fastRouter.get(
	LIST_FASTS,
	[
		...baseAuthClientOrAdminMiddlewares,
		projectMiddlewares.fetchProjectMiddleware,
		checkUserIsStakeholder,
	],
	fastControllers.listFastsController
);

module.exports = {
	fastRouter,
};
