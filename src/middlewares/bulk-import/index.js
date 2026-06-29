// middlewares/bulk-import/index.js

const { fileUploadMiddlewares } = require("./check-file-configuration.middleware");
const { parseFileMiddlewares } = require("./parse-import-file.middleware");
const { validateHeaderColumnMiddlewares } = require("./validate-headers.middleware");

const bulkImportMiddlewares = {
    ...fileUploadMiddlewares,
    ...parseFileMiddlewares,
    ...validateHeaderColumnMiddlewares
};

module.exports = {
    bulkImportMiddlewares
};
