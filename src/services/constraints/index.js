// services/constraints/index.js

const { createConstraintService } = require("./create-constraint.service");
const { updateConstraintService } = require("./update-constraint.service");
const { deleteConstraintService } = require("./delete-constraint.service");
const { getConstraintService } = require("./get-constraint.service");
const { listConstraintsService } = require("./list-constraint.service");
const { linkConstraintToHlfService } = require("./link-constraint-to-hlf.service");
const { unlinkConstraintToHlfService } = require("./unlink-constraint-to-hlf.service");

const constraintServices = {
  createConstraintService,
  updateConstraintService,
  deleteConstraintService,
  getConstraintService,
  listConstraintsService,
  linkConstraintToHlfService,
  unlinkConstraintToHlfService,
};

module.exports = { constraintServices };
