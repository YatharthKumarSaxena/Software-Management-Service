// utils/parsers/spreadsheet.parser.js

const XLSX = require("xlsx");

/**
 * Spreadsheet Parser
 *
 * Supports:
 *  - .csv
 *  - .xls
 *  - .xlsx
 */
const parseSpreadsheet = (filePath, extension) => {

    try {

        const workbook = XLSX.readFile(filePath, {
            type: "file",
            raw: false,
            ...(extension !== ".csv" && {
                cellDates: true
            })
        });

        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
            return {
                success: false,
                reason: "The uploaded file contains no worksheets."
            };
        }

        const sheet = workbook.Sheets[sheetName];

        const aoa = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: ""
        });

        if (!aoa.length) {
            return {
                success: false,
                reason: "The uploaded file is empty."
            };
        }

        const headers = aoa[0].map(header =>
            header ? String(header).trim() : ""
        );

        if (
            headers.length === 0 ||
            headers.every(h => h === "")
        ) {
            return {
                success: false,
                reason: "Invalid spreadsheet format."
            };
        }

        const rows = aoa
            .slice(1)
            .filter(row =>
                row.some(
                    cell =>
                        cell !== "" &&
                        cell !== null &&
                        cell !== undefined
                )
            )
            .map(row => {

                const object = {};

                headers.forEach((header, index) => {
                    object[header] =
                        row[index] !== undefined
                            ? row[index]
                            : "";
                });

                return object;

            });

        return {
            success: true,
            parser: "Spreadsheet Parser",
            data: {
                headers,
                rows,
                sheetName
            }
        };

    } catch (error) {

        return {
            success: false,
            reason: error.message
        };

    }

};

const spreadsheetParser = {
    name: "Spreadsheet Parser",
    supportedExtensions: [
        ".csv",
        ".xls",
        ".xlsx"
    ],
    parse: parseSpreadsheet
}

module.exports = {
    spreadsheetParser
};