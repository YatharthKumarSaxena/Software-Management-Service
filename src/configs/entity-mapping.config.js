// configs/entity-mapping.config.js

const { DB_COLLECTIONS } = require("./db-collections.config");

const ENTITY_MAPPING = {
    [DB_COLLECTIONS.HIGH_LEVEL_FEATURES]: "HLF",
    [DB_COLLECTIONS.SCOPES]: "SC",
    [DB_COLLECTIONS.REQUIREMENTS]: "REQ",
};

module.exports = {
    ENTITY_MAPPING
};