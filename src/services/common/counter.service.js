const { createCounterService } = require("../factory/counter-service.factory");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

const counterServices = {
    hlfCounterService: createCounterService(DB_COLLECTIONS.HIGH_LEVEL_FEATURES),
    scopeCounterService: createCounterService(DB_COLLECTIONS.SCOPES),
    requirementCounterService: createCounterService(DB_COLLECTIONS.REQUIREMENTS),
    projectCounterService: createCounterService(DB_COLLECTIONS.PROJECTS),
    productRequestCounterService: createCounterService(DB_COLLECTIONS.PRODUCT_REQUESTS),
    orgProjectRequestCounterService: createCounterService(DB_COLLECTIONS.ORG_PROJECT_REQUESTS),
    constraintCounterService: createCounterService(DB_COLLECTIONS.CONSTRAINTS),
    ideaCounterService: createCounterService(DB_COLLECTIONS.IDEAS)
}

module.exports = {
    counterServices
};