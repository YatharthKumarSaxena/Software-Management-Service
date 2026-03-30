// controllers/specifications/get-latest-specification.controller.js

const { getLatestSpecificationService } = require("../../services/specifications/get-latest-specification.service");
const {
  sendLatestSpecificationRetrievedSuccess,
} = require("../../responses/success/specification.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");


const getLatestSpecificationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getLatestSpecificationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Specification";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendLatestSpecificationRetrievedSuccess(res, result.specification);
};

module.exports = { getLatestSpecificationController };
