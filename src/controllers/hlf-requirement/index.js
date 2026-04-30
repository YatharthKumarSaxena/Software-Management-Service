const { getRequirementToHlfController } = require("./get-requirement-to-hlf.controller");
const { linkRequirementToHlfController } = require("./link-requirement-to-hlf.controller");
const { listRequirementToHlfController } = require("./list-requirement-to-hlf.controller");
const { unlinkRequirementToHlfController } = require("./unlink-requirement-to-hlf.controller");
const { updateRequirementToHlfController } = require("./update-requirement-to-hlf.controller");

const hlfRequirementControllers = {
    listRequirementToHlfController,
    getRequirementToHlfController,
    unlinkRequirementToHlfController,
    linkRequirementToHlfController,
    updateRequirementToHlfController
}

module.exports = { hlfRequirementControllers };