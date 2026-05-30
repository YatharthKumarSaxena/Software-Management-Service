const { createCounterService } = require("../factory/counter-service.factory");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

const counterServices = {
    hlfCounterService: createCounterService(DB_COLLECTIONS.HIGH_LEVEL_FEATURES),
    scopeCounterService: createCounterService(DB_COLLECTIONS.SCOPES),
    requirementCounterService: createCounterService(DB_COLLECTIONS.REQUIREMENTS)
}

module.exports = {
    counterServices
};