// controllers/validations/list-validations.controller.js

const { listValidationsService } = require("../../services/validations/list-validations.service");
const {
  sendValidationsListSuccess,
} = require("../../responses/success/validation.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const listValidationsController = async (req, res) => {
  const { projectId } = req.params;
  const { pageNumber = 1, pageSize = 10 } = req.query;

  const result = await listValidationsService({
    projectId,
    pageNumber: parseInt(pageNumber),
    pageSize: parseInt(pageSize),
  });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Validation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendValidationsListSuccess(res, result.validations, result.pagination);
};

module.exports = { listValidationsController };
