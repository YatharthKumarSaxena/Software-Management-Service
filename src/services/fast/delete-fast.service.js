const { ElicitationModel } = require("@models/elicitation.model");
const { ElicitationModes } = require("@configs/enums.config");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const deleteFastService = async ({ fastId, projectId, cancelledBy, updatedBy }) => {
	try {
		const actorId = cancelledBy || updatedBy;
		const fast = await ElicitationModel.findOne({
			_id: fastId,
			projectId,
			isDeleted: false,
			elicitationMode: "FAST"
		});

		if (!fast) {
			return { success: false, errorCode: BAD_REQUEST, message: "FAST meeting not found" };
		}

		fast.startedAt = null;
		fast.title = null;
		fast.description = null;
		fast.updatedBy = actorId;

		await fast.save();

		return {
			success: true,
			errorCode: OK,
			data: { fast }
		};
	} catch (error) {
		logWithTime(`❌ [deleteFastService] ${error.message}`);
		return { success: false, errorCode: INTERNAL_ERROR, message: "Internal error while cancelling FAST meeting" };
	}
};

module.exports = { deleteFastService };
