// middlewares/stakeholders/validate-request-body.middleware.js

const {
  createStakeholderField,
  updateStakeholderField,
  deleteStakeholderField,
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createStakeholderPresenceMiddleware: checkBodyPresence(createStakeholderField),
  updateStakeholderPresenceMiddleware: checkBodyPresence(updateStakeholderField),
  deleteStakeholderPresenceMiddleware: checkBodyPresence(deleteStakeholderField),
};

module.exports = { presenceMiddlewares };
