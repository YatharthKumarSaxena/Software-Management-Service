// controllers/ideas/index.js

const { createIdeaController } = require("./create-idea.controller");
const { updateIdeaController } = require("./update-idea.controller");
const { deleteIdeaController } = require("./delete-idea.controller");
const { acceptIdeaController } = require("./accept-idea.controller");
const { rejectIdeaController } = require("./reject-idea.controller");
const { deferIdeaController } = require("./defer-idea.controller");
const { reopenIdeaController } = require("./reopen-idea.controller");
const { getIdeaController } = require("./get-idea.controller");
const { listIdeasController } = require("./list-idea.controller");

const ideaControllers = {
  createIdeaController,
  updateIdeaController,
  deleteIdeaController,
  acceptIdeaController,
  rejectIdeaController,
  deferIdeaController,
  reopenIdeaController,
  getIdeaController,
  listIdeasController
};

module.exports = { ideaControllers };
