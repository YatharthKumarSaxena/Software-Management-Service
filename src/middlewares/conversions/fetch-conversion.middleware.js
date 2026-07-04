// middlewares/conversions/fetch-conversion.middleware.js

const { ConversionModel } = require("@models/conversion.model");
const { createFetchModelMiddleware } = require("../factory/fetch-model.middleware-factory");

const fetchConversionMiddleware = createFetchModelMiddleware({
        model: ConversionModel,
        modelName: "Conversion",

        idParamName: "conversionId",
        requestKey: "conversion",

        attachFields: [
            {
                source: "projectId",
                target: "projectId"
            }
        ]
    });

module.exports = {
    fetchConversionMiddleware
};
