const { createStakeholderController } = require("./create-stakeholder.controller");
const { deleteStakeholderController } = require("./delete-stakeholder.controller");
const { getStakeholderController } = require("./get-stakeholder.controller");
const { listStakeholdersController } = require("./list-stakeholders.controller");
const { updateStakeholderController } = require("./update-stakeholder.controller");

const stakeholderControllers = {
    createStakeholderController,
    updateStakeholderController,
    getStakeholderController,
    listStakeholdersController,
    deleteStakeholderController
}

module.exports = { stakeholderControllers };