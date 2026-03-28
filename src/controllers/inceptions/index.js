const { createInceptionController } = require("./create-inception.controller");
const { deleteInceptionController } = require("./delete-inception.controller");
const { freezeInceptionController } = require("./freeze-inception.controller");
const { getInceptionController } = require("./get-inception.controller");
const { getLatestInceptionController } = require("./get-latest-inception.controller");
const { listInceptionsController } = require("./list-inceptions.controller");

const inceptionControllers = {
    createInceptionController,
    deleteInceptionController,
    freezeInceptionController,
    getInceptionController,
    getLatestInceptionController,
    listInceptionsController
}

module.exports = {
    inceptionControllers
}
