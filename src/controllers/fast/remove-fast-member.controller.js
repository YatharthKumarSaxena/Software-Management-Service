const { removeFastMemberService } = require("@services/fast/remove-fast-member.service");
const {
	throwBadRequestError,
	throwInternalServerError,
	getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

const removeFastMemberController = async (req, res) => {
	try {
		const fastId = req.fast._id;
		const projectId = req.project._id;
		const { userId } = req.body;
		const removedBy = req.admin.adminId;

		const result = await removeFastMemberService({
			fastId,
			projectId,
			userId,
			removedBy
		});

		if (!result.success) {
			return throwBadRequestError(res, result.message);
		}

		logWithTime(`✅ [removeFastMemberController] FAST participant removed successfully | ${getLogIdentifiers(req)}`);
		return res.status(result.errorCode).json({
			success: true,
			message: "FAST participant removed successfully",
			data: result.data,
		});
	} catch (error) {
		logWithTime(`❌ [removeFastMemberController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
		return throwInternalServerError(res, error);
	}
};

module.exports = { removeFastMemberController };
