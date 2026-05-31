// controllers/high-level-features/index.js

const { createHlfController } = require("./create-hlf.controller");
const { deleteHlfController } = require("./delete-hlf.controller");
const { getHlfController } = require("./get-hlf.controller");
const { listHlfController } = require("./list-hlf.controller");
const { updateHlfController } = require("./update-hlf.controller");
const { linkHlfToIdeaController } = require("./link-hlf-to-idea.controller");
const { unlinkHlfFromIdeaController } = require("./unlink-hlf-to-idea.controller");

const hlfControllers = {
    createHlfController,
    updateHlfController,
    getHlfController,
    listHlfController,
    deleteHlfController,
    linkHlfToIdeaController,
    unlinkHlfFromIdeaController
}

module.exports = { hlfControllers };
