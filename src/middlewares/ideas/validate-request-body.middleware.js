// middlewares/ideas/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createIdeaPresenceMiddleware: checkBodyPresence("createIdeaPresence", requiredFields.createIdeaField),
  updateIdeaPresenceMiddleware: checkBodyPresence("updateIdeaPresence", requiredFields.updateIdeaField),
  acceptIdeaPresenceMiddleware: checkBodyPresence("acceptIdeaPresence", requiredFields.acceptIdeaField),
  rejectIdeaPresenceMiddleware: checkBodyPresence("rejectIdeaPresence", requiredFields.rejectIdeaField),
  deferIdeaPresenceMiddleware: checkBodyPresence("deferIdeaPresence", requiredFields.deferIdeaField),
  reopenIdeaPresenceMiddleware: checkBodyPresence("reopenIdeaPresence", requiredFields.reopenIdeaField)
};

module.exports = { presenceMiddlewares };
