// routes/conversion.routes.js

const express = require("express");
const conversionRouter = express.Router();

const { CONVERSION_ROUTES } = require("@configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { conversionControllers } = require("@controllers/conversions");
const { conversionMiddlewares } = require("@middlewares/conversions");
const { projectMiddlewares } = require("@middlewares/projects");
const { commonMiddlewares } = require("@middlewares/common");
const { getDataMiddleware, listDataMiddleware } = require("@middlewares/common/fetch-data.middleware");

const {
  CREATE_CONVERSION,
  GET_CONVERSION,
  LIST_CONVERSIONS
} = CONVERSION_ROUTES;

conversionRouter.post(
  CREATE_CONVERSION,
  [
    ...baseAuthAdminMiddlewares,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
    projectMiddlewares.activeProjectGuardMiddleware,
    conversionMiddlewares.createConversionPresenceMiddleware,
    conversionMiddlewares.createConversionValidationMiddleware,
  ],
  conversionControllers.createConversionController
);

conversionRouter.get(
  GET_CONVERSION,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getDataMiddleware,
    conversionMiddlewares.fetchConversionMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
  ],
  conversionControllers.getConversionController
);

conversionRouter.get(
  LIST_CONVERSIONS,
  [
    ...baseAuthClientOrAdminMiddlewares,
    listDataMiddleware,
    projectMiddlewares.fetchProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder
  ],
  conversionControllers.listConversionsController
);

module.exports = {
  conversionRouter
};
