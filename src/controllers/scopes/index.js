// controllers/scopes/index.js

const { createScopeController } = require("./create-scope.controller");
const { deleteScopeController } = require("./delete-scope.controller");
const { getScopeController } = require("./get-scope.controller");
const { listScopesController } = require("./list-scopes.controller");
const { updateScopeController } = require("./update-scope.controller");

const scopeControllers = {
    createScopeController,
    updateScopeController,
    getScopeController,
    listScopesController,
    deleteScopeController
}

module.exports = { scopeControllers };
