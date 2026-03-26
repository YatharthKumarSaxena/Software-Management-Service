const { createFastService } = require("./create-fast.service");
const { updateFastService } = require("./update-fast.service");
const { deleteFastService } = require("./delete-fast.service");
const { getFastService } = require("./get-fast.service");
const { listFastsService } = require("./list-fasts.service");
const { addFastMemberService } = require("./add-fast-member.service");
const { removeFastMemberService } = require("./remove-fast-member.service");

const fastServices = {
  createFastService,
  updateFastService,
  deleteFastService,
  getFastService,
  listFastsService,
  addFastMemberService,
  removeFastMemberService,
};

module.exports = { fastServices };
