const { listFastsService } = require("@services/fast/list-fasts.service");
const {
	throwBadRequestError,
	throwInternalServerError,
	getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

const listFastsController = async (req, res) => {
	try {
		const projectId = req.project._id;
		const { page = 1, limit = 20, sort = "-createdAt" } = req.query;

		const result = await listFastsService({
			projectId,
			page: Number.parseInt(page, 10),
			limit: Number.parseInt(limit, 10),
			sort,
		});

		if (!result.success) {
			return throwBadRequestError(res, result.message);
		}

		logWithTime(`✅ [listFastsController] FAST list retrieved successfully | ${getLogIdentifiers(req)}`);
		return res.status(result.errorCode).json({
			success: true,
			message: "FAST meetings retrieved successfully",
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error) {
		logWithTime(`❌ [listFastsController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
		return throwInternalServerError(res, error);
	}
};

module.exports = { listFastsController };
