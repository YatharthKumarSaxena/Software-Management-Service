const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
    throwBadRequestError,
    throwInternalServerError,
    logMiddlewareError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { cleanupUploadedFiles } = require("@/utils/bulk-import-temp.util");

const createFileUploadMiddleware = ({
    middlewareName = "File Upload",

    uploadType = "single",      // single | array

    fieldName = "file",

    maxFiles = 1,

    allowedExtensions = [],

    allowedMimeTypes = [],

    maxFileSizeMB = 20,

    destination,

    filename
}) => {

    if (!["single", "array"].includes(uploadType)) {
        throw new Error(
            `[${middlewareName}] uploadType must be 'single' or 'array'.`
        );
    }

    if (!Number.isInteger(maxFiles) || maxFiles <= 0) {
        throw new Error(
            `[${middlewareName}] maxFiles must be a positive integer.`
        );
    }

    if (typeof destination !== "function") {
        throw new Error(
            `[${middlewareName}] destination must be a function.`
        );
    }

    if (typeof filename !== "function") {
        throw new Error(
            `[${middlewareName}] filename must be a function.`
        );
    }

    if (!Array.isArray(allowedExtensions)) {
        throw new Error(`[${middlewareName}] allowedExtensions must be an array.`);
    }

    if (!Array.isArray(allowedMimeTypes)) {
        throw new Error(`[${middlewareName}] allowedMimeTypes must be an array.`);
    }

    if (!Number.isFinite(maxFileSizeMB) || maxFileSizeMB <= 0) {
        throw new Error(`[${middlewareName}] maxFileSizeMB must be a positive number.`);
    }

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            try {

                const uploadPath = destination(req, file);

                fs.mkdirSync(uploadPath, {
                    recursive: true
                });

                cb(null, uploadPath);

            } catch (error) {

                cb(error);

            }

        },

        filename: (req, file, cb) => {

            try {

                cb(
                    null,
                    filename(req, file)
                );

            } catch (error) {

                cb(error);

            }

        }

    });

    const fileFilter = (req, file, cb) => {

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (
            allowedExtensions.length &&
            !allowedExtensions.includes(extension)
        ) {

            return cb(
                new Error(
                    `Invalid file extension '${extension}'. Allowed: ${allowedExtensions.join(", ")}`
                )
            );

        }

        if (
            allowedMimeTypes.length &&
            !allowedMimeTypes.includes(file.mimetype)
        ) {

            return cb(
                new Error(
                    `Invalid MIME type '${file.mimetype}'.`
                )
            );

        }

        cb(null, true);

    };

    const multerInstance = multer({

        storage,

        fileFilter,

        limits: {

            fileSize: maxFileSizeMB * 1024 * 1024,

            files: maxFiles

        }

    });

    const multerUpload =
        uploadType === "array"
            ? multerInstance.array(fieldName, maxFiles)
            : multerInstance.single(fieldName);

    return (req, res, next) => {

        try {
            multerUpload(req, res, (error) => {

                if (error) {
                    cleanupUploadedFiles({
                        file: req.file,
                        files: req.files
                    });

                    logMiddlewareError(
                        middlewareName,
                        error.message,
                        req
                    );

                    if (error instanceof multer.MulterError) {

                        switch (error.code) {

                            case "LIMIT_FILE_SIZE":

                                return throwBadRequestError(
                                    res,
                                    `Maximum allowed file size is ${maxFileSizeMB} MB.`
                                );

                            case "LIMIT_FILE_COUNT":
                                return throwBadRequestError(
                                    res,
                                    `Maximum ${maxFiles} file(s) are allowed.`
                                );

                            case "LIMIT_UNEXPECTED_FILE":

                                return throwBadRequestError(
                                    res,
                                    `Unexpected field. Expected '${fieldName}'.`
                                );

                            default:

                                return throwBadRequestError(
                                    res,
                                    error.message
                                );

                        }

                    }

                    return throwBadRequestError(
                        res,
                        error.message
                    );

                }

                const hasUploadedFiles =
                    uploadType === "single"
                        ? !!req.file
                        : Array.isArray(req.files) && req.files.length > 0;

                if (!hasUploadedFiles) {

                    logMiddlewareError(
                        middlewareName,
                        `No file uploaded. Field name must be '${fieldName}'.`,
                        req
                    );

                    return throwBadRequestError(
                        res,
                        uploadType === "single"
                            ? `No file uploaded. Field name must be '${fieldName}'.`
                            : `No files uploaded. Field name must be '${fieldName}'.`
                    );

                }

                logWithTime(
                    `✅ ${middlewareName}: ${uploadType === "single"
                        ? "File"
                        : `${req.files.length} file(s)`
                    } uploaded successfully.`
                );
                return next();

            });
        } catch (error) {
            logMiddlewareError(
                middlewareName,
                error.message,
                req
            );
            cleanupUploadedFiles({ file: req.file, files: req.files });
            return throwInternalServerError(res, error);
        }

    };

};

module.exports = {
    createFileUploadMiddleware
};