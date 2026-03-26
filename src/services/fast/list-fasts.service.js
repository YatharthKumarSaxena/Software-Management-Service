const { ElicitationModel } = require("@models/elicitation.model");
const { AdminModel } = require("@models/admin.model");
const { ClientModel } = require("@models/client.model");
const { ElicitationModes, ParticipantTypes } = require("@configs/enums.config");
const { OK, INTERNAL_ERROR } = require("@configs/http-status.config");
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

const listFastsService = async ({ projectId, page = 1, limit = 20, sort = "-createdAt" }) => {
	try {
		const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
		const pageSize = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 20));
		const skip = (pageNum - 1) * pageSize;

		const query = {
			projectId,
			isDeleted: false,
			elicitationMode: ElicitationModes.FAST
		};

		const [totalCount, fasts] = await Promise.all([
			ElicitationModel.countDocuments(query),
			ElicitationModel.find(query).sort(sort).skip(skip).limit(pageSize).lean()
		]);

		const userIds = [];
		fasts.forEach((fast) => {
			if (fast.updatedBy) userIds.push(fast.updatedBy);
			(fast.participants || []).forEach((p) => {
				if (!p.isDeleted) userIds.push(p.userId);
			});
		});

		const userNames = await resolveUserNamesByIds(userIds);

		const formattedFasts = fasts.map((fast) => {
			const participants = (fast.participants || [])
				.filter((p) => !p.isDeleted)
				.map((participant) => ({
					userId: participant.userId,
					name: userNames[participant.userId] || participant.userId,
					role: participant.role,
					roleDescription: participant.roleDescription,
					addedAt: participant.addedAt
				}));

			return {
				_id: fast._id,
				title: fast.title,
				description: fast.description,
				startedAt: fast.startedAt,
				updatedBy: fast.updatedBy,
				updatedByName: fast.updatedBy ? (userNames[fast.updatedBy] || fast.updatedBy) : null,
				facilitator: participants.find((p) => p.role === ParticipantTypes.FACILITATOR) || null,
				participants
			};
		});

		const totalPages = Math.ceil(totalCount / pageSize) || 1;

		return {
			success: true,
			errorCode: OK,
			data: { fasts: formattedFasts },
			pagination: {
				page: pageNum,
				limit: pageSize,
				totalCount,
				totalPages,
				hasNextPage: pageNum < totalPages,
				hasPreviousPage: pageNum > 1
			}
		};
	} catch (error) {
		logWithTime(`❌ [listFastsService] ${error.message}`);
		return { success: false, errorCode: INTERNAL_ERROR, message: "Internal error while listing FAST meetings" };
	}
};

module.exports = { listFastsService };
