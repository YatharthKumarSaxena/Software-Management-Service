// controllers/specifications/list-specifications.controller.js

const { listSpecificationsService } = require("../../services/specifications/list-specifications.service");
const {
  sendSpecificationsListSuccess,
} = require("../../responses/success/specification.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const listSpecificationsController = async (req, res) => {
  const { projectId } = req.params;
  const { pageNumber = 1, pageSize = 10 } = req.query;

  const result = await listSpecificationsService({
    projectId,
    pageNumber: parseInt(pageNumber),
    pageSize: parseInt(pageSize),
  });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Specification";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendSpecificationsListSuccess(res, result.specifications, result.pagination);
};

module.exports = { listSpecificationsController };
