// middlewares/bulk-import/parse-import-file.middleware.js

const { createParseFileMiddleware } = require("@middlewares/factory/parse-file.middleware-factory");
const { spreadsheetParser } = require("@/utils/parsers/spreadsheet.parser.util");

const parseFileMiddlewares = {
    parseSpreadsheetFileMiddleware: createParseFileMiddleware({
        middlewareName: "Spreadsheet Parser",
        parsers: [
            spreadsheetParser
        ]
    })
}


module.exports = {
    parseFileMiddlewares
};