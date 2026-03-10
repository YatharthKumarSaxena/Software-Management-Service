const { INTERNAL_BASE, TEST_BASE, ADMIN_BASE } = require("@/configs/uri.config");
const { internalRouter } = require("./internal.routes");
const { testRouter } = require("./test.routes");
const { adminRouter } = require("./admin.routes");

module.exports = (app) => {
  // Internal service-to-service routes (protected by service token)
  app.use(INTERNAL_BASE, internalRouter);

  // Test / smoke-test routes
  app.use(TEST_BASE, testRouter);

  // Admin-facing API routes
  app.use(ADMIN_BASE, adminRouter);
};