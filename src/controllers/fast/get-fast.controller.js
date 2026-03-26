const { getFastService } = require("@services/fast/get-fast.service");
const {
	throwBadRequestError,
	throwInternalServerError,
	getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

const getFastController = async (req, res) => {
	try {
		const fastId = req.fast._id;
		const projectId = req.project._id;

		const result = await getFastService({ fastId, projectId });
		if (!result.success) {
			return throwBadRequestError(res, result.message);
		}

		logWithTime(`✅ [getFastController] FAST retrieved successfully | ${getLogIdentifiers(req)}`);
		return res.status(result.errorCode).json({
			success: true,
			message: "FAST meeting retrieved successfully",
			data: result.data,
		});
	} catch (error) {
		logWithTime(`❌ [getFastController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
		return throwInternalServerError(res, error);
	}
};

module.exports = { getFastController };
