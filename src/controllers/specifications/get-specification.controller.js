// controllers/specifications/get-specification.controller.js

const { getSpecificationService } = require("../../services/specifications/get-specification.service");
const {
  sendSpecificationRetrievedSuccess,
} = require("../../responses/success/specification.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const getSpecificationController = async (req, res) => {
  const specification = req.specification; // Set by previous middleware

  const result = await getSpecificationService(specification );

  if (!result.success) {
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendSpecificationRetrievedSuccess(res, result.specification);
};

module.exports = { getSpecificationController };
