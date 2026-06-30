// controllers/constraints/index.js

const { createConstraintController } = require("./create-constraint.controller");
const { updateConstraintController } = require("./update-constraint.controller");
const { deleteConstraintController } = require("./delete-constraint.controller");
const { getConstraintController } = require("./get-constraint.controller");
const { listConstraintsController } = require("./list-constraints.controller");
const { linkConstraintToHlfController } = require("./link-constraint-to-hlf.controller");
const { unlinkConstraintToHlfController } = require("./unlink-constraint-to-hlf.controller");

const constraintControllers = {
    createConstraintController,
    updateConstraintController,
    deleteConstraintController,
    getConstraintController,
    listConstraintsController,
    linkConstraintToHlfController,
    unlinkConstraintToHlfController,
};

module.exports = { constraintControllers };
