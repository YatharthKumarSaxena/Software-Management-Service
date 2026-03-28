// routes/product-vision.routes.js

const express = require("express");
const productVisionRouter = express.Router();

const { PRODUCT_VISION_ROUTES } = require("@/configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { productVisionControllers } = require("@controllers/product-vision");
const { productVisionMiddlewares } = require("@/middlewares/product-vision");
const { projectMiddlewares } = require("@/middlewares/projects");
const { commonMiddlewares } = require("@/middlewares/common");
const { createProductVisionRateLimiter, deleteProductVisionRateLimiter, updateProductVisionRateLimiter, getProductVisionRateLimiter } = require("@/rate-limiters/general-api.rate-limiter");

const {
  CREATE_PRODUCT_VISION,
  UPDATE_PRODUCT_VISION,
  DELETE_PRODUCT_VISION,
  GET_PRODUCT_VISION
} = PRODUCT_VISION_ROUTES;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware chain order:
//  1. baseAuthAdminMiddlewares       – device check, JWT verify, fetch admin, status checks
//  2. fetchProjectMiddleware         – load project from params
//  3. fetchInceptionFromProject      – load inception for project
//  4. checkUserIsStakeholder         – verify admin is stakeholder of project
//  5. activeProjectGuardMiddleware   – verify project is not DRAFT (create/update/delete only)
//  6. Presence middleware            – required fields in req.body
//  7. Validation middleware          – type / length checks
//  8. Controller                     – business logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /software-management-service/api/v1/product-vision/create/:projectId
 * Create product vision for the project's current inception phase.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project
 */
productVisionRouter.post(
  CREATE_PRODUCT_VISION,
  [
    ...baseAuthAdminMiddlewares,
    createProductVisionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    productVisionMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkInceptionNotFrozen,
    commonMiddlewares.checkUserIsStakeholder,
    productVisionMiddlewares.createProductVisionPresenceMiddleware,
    productVisionMiddlewares.createProductVisionValidationMiddleware,
  ],
  productVisionControllers.createProductVisionController
);

/**
 * PATCH /software-management-service/api/v1/product-vision/update/:projectId
 * Update existing product vision.
 * Allowed roles: CEO, Business Analyst, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
productVisionRouter.patch(
  UPDATE_PRODUCT_VISION,
  [
    ...baseAuthAdminMiddlewares,
    updateProductVisionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    productVisionMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkInceptionNotFrozen,
    commonMiddlewares.checkUserIsStakeholder,
    productVisionMiddlewares.updateProductVisionPresenceMiddleware,
    productVisionMiddlewares.updateProductVisionValidationMiddleware,
  ],
  productVisionControllers.updateProductVisionController
);

/**
 * DELETE /software-management-service/api/v1/product-vision/delete/:projectId
 * Delete product vision. Optional deletion reason can be provided.
 * Allowed roles: CEO, Manager
 * Requires: admin is a stakeholder of the project, project is not DRAFT
 */
productVisionRouter.delete(
  DELETE_PRODUCT_VISION,
  [
    ...baseAuthAdminMiddlewares,
    deleteProductVisionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,
    productVisionMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkInceptionNotFrozen,
    commonMiddlewares.checkUserIsStakeholder,
    productVisionMiddlewares.deleteProductVisionValidationMiddleware,
  ],
  productVisionControllers.deleteProductVisionController
);

/**
 * GET /software-management-service/api/v1/product-vision/get/:projectId
 * Fetch product vision. Accessible by both admin and client stakeholders.
 */
productVisionRouter.get(
  GET_PRODUCT_VISION,
  [
    ...baseAuthClientOrAdminMiddlewares,
    getProductVisionRateLimiter,
    projectMiddlewares.fetchProjectMiddleware,
    productVisionMiddlewares.fetchInceptionFromProjectMiddleware,
    commonMiddlewares.checkUserIsStakeholder,
  ],
  productVisionControllers.getProductVisionController
);

module.exports = { productVisionRouter };
