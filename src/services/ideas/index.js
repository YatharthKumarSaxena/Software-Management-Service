// services/ideas/index.js

const { createIdeaService } = require("./create-idea.service");
const { updateIdeaService } = require("./update-idea.service");
const { deleteIdeaService } = require("./delete-idea.service");
const { acceptIdeaService } = require("./accept-idea.service");
const { rejectIdeaService } = require("./reject-idea.service");
const { deferIdeaService } = require("./defer-idea.service");
const { reopenIdeaService } = require("./reopen-idea.service");
const { getIdeaService } = require("./get-idea.service");
const { listIdeasService } = require("./list-ideas.service");

const ideaServices = {
  createIdeaService,
  updateIdeaService,
  deleteIdeaService,
  acceptIdeaService,
  rejectIdeaService,
  deferIdeaService,
  reopenIdeaService,
  getIdeaService,
  listIdeasService
};

module.exports = { ideaServices };
