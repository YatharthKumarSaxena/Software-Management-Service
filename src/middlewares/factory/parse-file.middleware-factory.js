const path = require("path");

const {
    throwBadRequestError,
    throwInternalServerError,
    logMiddlewareError
} = require("@responses/common/error-handler.response");

const { logWithTime } = require("@/utils/time-stamps.util");
const { cleanupUploadedFiles } = require("@/utils/bulk-import-temp.util");

const createParseFileMiddleware = ({
    middlewareName = "Parse File",
    parsers = []
}) => {

    return (req, res, next) => {

        try {

            const uploadedFiles = req.file
                ? [req.file]
                : req.files || [];

            if (!uploadedFiles.length) {

                logMiddlewareError(
                    middlewareName,
                    "No uploaded files found.",
                    req
                );

                return throwBadRequestError(
                    res,
                    "No uploaded files found."
                );

            }

            const parsedData = [];

            for (const file of uploadedFiles) {

                const extension = path
                    .extname(file.originalname)
                    .toLowerCase();

                let parserFound = false;

                for (const parser of parsers) {

                    if (
                        parser.supportedExtensions &&
                        !parser.supportedExtensions.includes(extension)
                    ) {
                        continue;
                    }

                    parserFound = true;

                    const result = parser.parse(
                        file.path,
                        extension
                    );

                    if (!result.success) {

                        logMiddlewareError(
                            middlewareName,
                            result.reason,
                            req
                        );

                        cleanupUploadedFiles({
                            file: req.file,
                            files: req.files
                        });

                        return throwBadRequestError(
                            res,
                            result.reason
                        );

                    }

                    parsedData.push(result.data);

                    logWithTime(
                        `✅ [${middlewareName}] '${file.originalname}' parsed successfully using '${parser.name}'.`
                    );

                    break;
                }

                if (!parserFound) {

                    logMiddlewareError(
                        middlewareName,
                        `No parser found for '${extension}'.`,
                        req
                    );

                    cleanupUploadedFiles({
                        file: req.file,
                        files: req.files
                    });

                    return throwBadRequestError(
                        res,
                        `Unsupported file format '${extension}'.`
                    );

                }

            }

            req.importData =
                parsedData.length === 1
                    ? parsedData[0]
                    : parsedData;

            return next();

        } catch (error) {

            logMiddlewareError(
                middlewareName,
                "Unexpected error while parsing file.",
                req
            );

            cleanupUploadedFiles({
                file: req.file,
                files: req.files
            });

            return throwInternalServerError(
                res,
                error
            );

        }

    };

};

module.exports = {
    createParseFileMiddleware
};