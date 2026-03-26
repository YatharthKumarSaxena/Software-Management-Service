const { addFastMemberService } = require("@services/fast/add-fast-member.service");
const {
	throwBadRequestError,
	throwConflictError,
	throwInternalServerError,
	getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");

const addFastMemberController = async (req, res) => {
	try {
		const fastId = req.fast._id;
		const projectId = req.project._id;
		const { userId, role, roleDescription } = req.body;
		const addedBy = req.admin.adminId;

		const result = await addFastMemberService({
			fastId,
			projectId,
			userId,
			role,
			roleDescription,
			addedBy
		});

		if (!result.success) {
			if (result.errorCode === CONFLICT) {
				return throwConflictError(res, result.message, "Use remove endpoint first or add a different participant");
			}
			return throwBadRequestError(res, result.message);
		}

		logWithTime(`✅ [addFastMemberController] FAST participant added successfully | ${getLogIdentifiers(req)}`);
		return res.status(result.errorCode).json({
			success: true,
			message: "FAST participant added successfully",
			data: result.data,
		});
	} catch (error) {
		logWithTime(`❌ [addFastMemberController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
		return throwInternalServerError(res, error);
	}
};

module.exports = { addFastMemberController };
