const { createInceptionController } = require("./create-inception.controller");
const { deleteInceptionController } = require("./delete-inception.controller");
const { getInceptionController } = require("./get-inception.controller");
const { getLatestInceptionController } = require("./get-latest-inception.controller");
const { listInceptionsController } = require("./list-inceptions.controller");
const { updateInceptionController } = require("./update-inception.controller");

const inceptionControllers = {
    createInceptionController,
    deleteInceptionController,
    getInceptionController,
    getLatestInceptionController,
    listInceptionsController,
    updateInceptionController
}

module.exports = {
    inceptionControllers
}
