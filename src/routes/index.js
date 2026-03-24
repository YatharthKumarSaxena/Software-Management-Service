const { INTERNAL_BASE, TEST_BASE, PROJECT_BASE, STAKEHOLDER_BASE, PRODUCT_REQUEST_BASE, SCOPE_BASE, HLF_BASE, PRODUCT_VISION_BASE, COMMENT_BASE, ACTIVITY_TRACKER_BASE } = require("@/configs/uri.config");
const { internalRouter }    = require("./internal.routes");
const { testRouter }        = require("./test.routes");
const { projectRouter }     = require("./project.routes");
const { stakeholderRouter } = require("./stakeholder.routes");
const { productRequestRouter } = require("./product-request.routes");
const { scopeRouter } = require("./scope.routes");
const { hlfRouter } = require("./high-level-features.routes");
const { productVisionRouter } = require("./product-vision.routes");
const { commentRouter } = require("./comment.routes");
const { activityTrackerRouter } = require("./activity-tracker.routes");

module.exports = (app) => {
  // Internal service-to-service routes (protected by service token)
  app.use(INTERNAL_BASE, internalRouter);

  // Test / smoke-test routes
  app.use(TEST_BASE, testRouter);

  // Admin-facing API routes — projects
  app.use(PROJECT_BASE, projectRouter);

  // Admin-facing API routes — stakeholders
  app.use(STAKEHOLDER_BASE, stakeholderRouter);

  app.use(PRODUCT_REQUEST_BASE, productRequestRouter);

  // Admin/Client-facing API routes — scopes
  app.use(SCOPE_BASE, scopeRouter);

  // Admin/Client-facing API routes — high-level features
  app.use(HLF_BASE, hlfRouter);

  // Admin/Client-facing API routes — product vision
  app.use(PRODUCT_VISION_BASE, productVisionRouter);

  // Admin/Client-facing API routes — comments
  app.use(COMMENT_BASE, commentRouter);

  // Admin/Client-facing API routes — activity trackers
  app.use(ACTIVITY_TRACKER_BASE, activityTrackerRouter);

};