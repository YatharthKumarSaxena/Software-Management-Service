// services/high-level-features/index.js

const { createHlfService } = require("./create-hlf.service");
const { updateHlfService } = require("./update-hlf.service");
const { deleteHlfService } = require("./delete-hlf.service");
const { getHlfService } = require("./get-hlf.service");
const { listHlfService } = require("./list-hlf.service");
const { linkHlfToIdeaService } = require("./link-hlf-to-idea.service");
const { unlinkHlfFromIdeaService } = require("./unlink-hlf-to-idea.service");

const hlfServices = {
  createHlfService,
  updateHlfService,
  deleteHlfService,
  getHlfService,
  listHlfService,
  linkHlfToIdeaService,
  unlinkHlfFromIdeaService
};

module.exports = { hlfServices };
