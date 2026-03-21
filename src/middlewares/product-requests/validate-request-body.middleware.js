const {
    createProductRequestField,
    updateProductRequestField,
    deleteProductRequestField,
    approveProductRequestField,
    rejectProductRequestField 
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
    createProductRequestPresenceMiddleware: checkBodyPresence("createProductRequestPresence", createProductRequestField),
    updateProductRequestPresenceMiddleware: checkBodyPresence("updateProductRequestPresence", updateProductRequestField),
    deleteProductRequestPresenceMiddleware: checkBodyPresence("deleteProductRequestPresence", deleteProductRequestField),
    approveProductRequestPresenceMiddleware: checkBodyPresence("approveProductRequestPresence", approveProductRequestField),
    rejectProductRequestPresenceMiddleware: checkBodyPresence("rejectProductRequestPresence", rejectProductRequestField),
};

module.exports = { presenceMiddlewares };