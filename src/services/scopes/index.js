// services/scopes/index.js

const { createScopeService } = require("./create-scope.service");
const { updateScopeService } = require("./update-scope.service");
const { deleteScopeService } = require("./delete-scope.service");
const { getScopeService } = require("./get-scope.service");
const { listScopeService } = require("./list-scope.service");
const { linkScopeToHlfService } = require("./link-scope-to-hlf.service");
const { unlinkScopeToHlfService } = require("./unlink-scope-to-hlf.service");

const scopeServices = {
  createScopeService,
  updateScopeService,
  deleteScopeService,
  getScopeService,
  listScopeService,
  linkScopeToHlfService,
  unlinkScopeToHlfService
};

module.exports = { scopeServices };
