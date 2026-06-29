const {
  REQUIREMENT_BULK_IMPORT_FILE_CONFIG
} = require("@configs/file-upload.config");

const {
  createFileUploadMiddleware
} = require("@middlewares/factory/file-validation.middleware.factory");

const fileUploadMiddlewares = {
  checkRequirementFileUploadConfiguration: createFileUploadMiddleware({
    middlewareName: "checkRequirementBulkImportFileConfiguration",
    ...REQUIREMENT_BULK_IMPORT_FILE_CONFIG
  })
}

module.exports = {
  fileUploadMiddlewares
};