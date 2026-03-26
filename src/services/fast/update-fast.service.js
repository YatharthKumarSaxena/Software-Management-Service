const { ElicitationModel } = require("@models/elicitation.model");
const { ElicitationModes } = require("@configs/enums.config");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const updateFastService = async ({ fastId, projectId, title, description, startedAt, updatedBy }) => {
	try {
		const fast = await ElicitationModel.findOne({
			_id: fastId,
			projectId,
			isDeleted: false,
			elicitationMode: ElicitationModes.FAST
		});

		if (!fast) {
			return { success: false, errorCode: BAD_REQUEST, message: "FAST meeting not found" };
		}

		if (startedAt !== undefined) {
			const parsedStartedAt = new Date(startedAt);
			if (Number.isNaN(parsedStartedAt.getTime())) {
				return { success: false, errorCode: BAD_REQUEST, message: "startedAt must be a valid date" };
			}
			if (parsedStartedAt.getTime() < Date.now()) {
				return { success: false, errorCode: BAD_REQUEST, message: "startedAt must be greater than or equal to current time" };
			}
			fast.startedAt = parsedStartedAt;
		}

		if (title !== undefined) fast.title = title;
		if (description !== undefined) fast.description = description;
		fast.updatedBy = updatedBy;

		await fast.save();

		return {
			success: true,
			errorCode: OK,
			data: { fast }
		};
	} catch (error) {
		logWithTime(`❌ [updateFastService] ${error.message}`);
		return { success: false, errorCode: INTERNAL_ERROR, message: "Internal error while updating FAST meeting" };
	}
};

module.exports = { updateFastService };
