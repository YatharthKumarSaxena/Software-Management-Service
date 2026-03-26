const mongoose = require("mongoose");
const { ElicitationModel } = require("@models/elicitation.model");
const { ElicitationModes } = require("@configs/enums.config");
const { CREATED, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const createFastService = async ({ projectId, title, description, startedAt, createdBy }) => {
	try {
		if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
			return { success: false, errorCode: BAD_REQUEST, message: "Invalid projectId format" };
		}

		if (!title || !description || !startedAt) {
			return { success: false, errorCode: BAD_REQUEST, message: "title, description and startedAt are required" };
		}

		const parsedStartedAt = new Date(startedAt);
		if (Number.isNaN(parsedStartedAt.getTime())) {
			return { success: false, errorCode: BAD_REQUEST, message: "startedAt must be a valid date" };
		}

		if (parsedStartedAt.getTime() < Date.now()) {
			return { success: false, errorCode: BAD_REQUEST, message: "startedAt must be greater than or equal to current time" };
		}

		const fast = await ElicitationModel.create({
			projectId,
			title: title.trim(),
			description: description.trim(),
			startedAt: parsedStartedAt,
			createdBy,
			updatedBy: createdBy,
			elicitationMode: ElicitationModes.FAST,
			participants: []
		});

		return {
			success: true,
			errorCode: CREATED,
			data: { fast }
		};
	} catch (error) {
		logWithTime(`❌ [createFastService] ${error.message}`);
		return { success: false, errorCode: INTERNAL_ERROR, message: "Internal error while creating FAST meeting" };
	}
};

module.exports = { createFastService };
