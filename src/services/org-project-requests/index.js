// services/clients/org-project-requests/index.js

const { createOrgProjectRequestService } = require("./create-org-project-request.service");
const { getOrgProjectRequestService } = require("./get-org-project-request.service");
const { listMyOrgProjectRequestsService } = require("./list-my-org-project-requests.service");
const { listProjectOrgRequestsService } = require("./list-project-org-requests.service");
const { approveOrgProjectRequestService } = require("./approve-org-project-request.service");
const { rejectOrgProjectRequestService } = require("./reject-org-project-request.service");
const { withdrawOrgProjectRequestService } = require("./withdraw-org-project-request.service");
const { updateOrgProjectRequestService } = require("./update-org-project-request.service");

module.exports = {
  createOrgProjectRequestService,
  getOrgProjectRequestService,
  listMyOrgProjectRequestsService,
  listProjectOrgRequestsService,
  approveOrgProjectRequestService,
  rejectOrgProjectRequestService,
  withdrawOrgProjectRequestService,
  updateOrgProjectRequestService
};
