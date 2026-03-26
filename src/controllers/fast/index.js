const { createFastController } = require("./create-fast.controller");
const { updateFastController } = require("./update-fast.controller");
const { deleteFastController } = require("./delete-fast.controller");
const { getFastController } = require("./get-fast.controller");
const { listFastsController } = require("./list-fasts.controller");
const { addFastMemberController } = require("./add-fast-member.controller");
const { removeFastMemberController } = require("./remove-fast-member.controller");

const fastControllers = {
  createFastController,
  updateFastController,
  deleteFastController,
  getFastController,
  listFastsController,
  addFastMemberController,
  removeFastMemberController,
};

module.exports = { fastControllers };
