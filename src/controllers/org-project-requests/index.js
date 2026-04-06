// controllers/org-project-requests/index.js

const { createOrgProjectRequestController } = require("./create-org-project-request.controller");
const { getOrgProjectRequestController } = require("./get-org-project-request.controller");
const { listMyOrgProjectRequestsController } = require("./list-my-org-project-requests.controller");
const { listProjectOrgRequestsController } = require("./list-project-org-requests.controller");
const { approveOrgProjectRequestController } = require("./approve-org-project-request.controller");
const { rejectOrgProjectRequestController } = require("./reject-org-project-request.controller");
const { withdrawOrgProjectRequestController } = require("./withdraw-org-project-request.controller");
const { updateOrgProjectRequestController } = require("./update-org-project-request.controller");

const orgProjectRequestControllers = {
  createOrgProjectRequestController,
  getOrgProjectRequestController,
  listMyOrgProjectRequestsController,
  listProjectOrgRequestsController,
  approveOrgProjectRequestController,
  rejectOrgProjectRequestController,
  withdrawOrgProjectRequestController,
  updateOrgProjectRequestController
};

module.exports = {
  createOrgProjectRequestController,
  getOrgProjectRequestController,
  listMyOrgProjectRequestsController,
  listProjectOrgRequestsController,
  approveOrgProjectRequestController,
  rejectOrgProjectRequestController,
  withdrawOrgProjectRequestController,
  updateOrgProjectRequestController,
  orgProjectRequestControllers
};
