// controllers/elaborations/get-latest-elaboration.controller.js

const { getLatestElaborationService } = require("../../services/elaborations/get-latest-elaboration.service");
const {
  sendLatestElaborationRetrievedSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");


const getLatestElaborationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getLatestElaborationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Elaboration";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendLatestElaborationRetrievedSuccess(res, result.elaboration);
};

module.exports = { getLatestElaborationController };
