// controllers/elaborations/list-elaborations.controller.js

const { listElaborationsService } = require("../../services/elaborations/list-elaborations.service");
const {
  sendElaborationsListSuccess
} = require("../../responses/success/elaboration.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const listElaborationsController = async (req, res) => {
  const { projectId } = req.params;
  const { pageNumber = 1, pageSize = 10 } = req.query;

  const result = await listElaborationsService({
    projectId,
    pageNumber: parseInt(pageNumber),
    pageSize: parseInt(pageSize),
  });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Elaboration";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendElaborationsListSuccess(res, result.elaborations, result.pagination);
};

module.exports = { listElaborationsController };
