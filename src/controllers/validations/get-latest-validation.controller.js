// controllers/validations/get-latest-validation.controller.js

const { getLatestValidationService } = require("../../services/validations/get-latest-validation.service");
const {
  sendLatestValidationRetrievedSuccess,
} = require("../../responses/success/validation.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");


const getLatestValidationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getLatestValidationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Validation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendLatestValidationRetrievedSuccess(res, result.validation);
};

module.exports = { getLatestValidationController };
