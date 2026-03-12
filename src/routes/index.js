const { INTERNAL_BASE, TEST_BASE, PROJECT_BASE, STAKEHOLDER_BASE, CLIENT_BASE } = require("@/configs/uri.config");
const { internalRouter }    = require("./internal.routes");
const { testRouter }        = require("./test.routes");
const { projectRouter }     = require("./project.routes");
const { stakeholderRouter } = require("./stakeholder.routes");
const { clientRouter }      = require("./client.routes");

module.exports = (app) => {
  // Internal service-to-service routes (protected by service token)
  app.use(INTERNAL_BASE, internalRouter);

  // Test / smoke-test routes
  app.use(TEST_BASE, testRouter);

  // Admin-facing API routes — projects
  app.use(PROJECT_BASE, projectRouter);

  // Admin-facing API routes — stakeholders
  app.use(STAKEHOLDER_BASE, stakeholderRouter);

  // Client-facing read-only API routes
  app.use(CLIENT_BASE, clientRouter);
};