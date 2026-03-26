const { ElicitationModel } = require("@models/elicitation.model");
const { AdminModel } = require("@models/admin.model");
const { ClientModel } = require("@models/client.model");
const { ElicitationModes, ParticipantTypes } = require("@configs/enums.config");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const resolveUserNamesByIds = async (userIds = []) => {
	const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
	if (uniqueIds.length === 0) return {};

	const [admins, clients] = await Promise.all([
		AdminModel.find({ adminId: { $in: uniqueIds }, isDeleted: false }).select("adminId firstName").lean(),
		ClientModel.find({ clientId: { $in: uniqueIds }, isDeleted: false }).select("clientId firstName").lean()
	]);

	const nameMap = {};
	admins.forEach((a) => {
		nameMap[a.adminId] = a.firstName || a.adminId;
	});
	clients.forEach((c) => {
		nameMap[c.clientId] = c.firstName || c.clientId;
	});
	return nameMap;
};

const getFastService = async ({ fastId, projectId }) => {
	try {
		const fast = await ElicitationModel.findOne({
			_id: fastId,
			projectId,
			isDeleted: false,
			elicitationMode: ElicitationModes.FAST
		}).lean();

		if (!fast) {
			return { success: false, errorCode: BAD_REQUEST, message: "FAST meeting not found" };
		}

		const activeParticipants = (fast.participants || []).filter((p) => !p.isDeleted);
		const userIds = activeParticipants.map((p) => p.userId);
		if (fast.updatedBy) userIds.push(fast.updatedBy);

		const userNames = await resolveUserNamesByIds(userIds);

		const participants = activeParticipants.map((participant) => ({
			userId: participant.userId,
			name: userNames[participant.userId] || participant.userId,
			role: participant.role,
			roleDescription: participant.roleDescription,
			addedAt: participant.addedAt
		}));

		const facilitator = participants.find((p) => p.role === ParticipantTypes.FACILITATOR) || null;

		return {
			success: true,
			errorCode: OK,
			data: {
				fast: {
					_id: fast._id,
					title: fast.title,
					description: fast.description,
					startedAt: fast.startedAt,
					updatedBy: fast.updatedBy,
					updatedByName: fast.updatedBy ? (userNames[fast.updatedBy] || fast.updatedBy) : null,
					facilitator,
					participants
				}
			}
		};
	} catch (error) {
		logWithTime(`❌ [getFastService] ${error.message}`);
		return { success: false, errorCode: INTERNAL_ERROR, message: "Internal error while fetching FAST meeting" };
	}
};

module.exports = { getFastService };
