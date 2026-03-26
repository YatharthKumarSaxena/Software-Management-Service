const { ElicitationModel } = require("@models/elicitation.model");
const { ElicitationModes, ParticipantTypes } = require("@configs/enums.config");
const { customIdRegex } = require("@configs/regex.config");
const { OK, BAD_REQUEST, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const addFastMemberService = async ({ fastId, projectId, userId, role, roleDescription, addedBy }) => {
  try {
    if (!customIdRegex.test(userId || "")) {
      return { success: false, errorCode: BAD_REQUEST, message: "Invalid userId format" };
    }

    const effectiveRole = role || ParticipantTypes.PARTICIPANT;
    if (!Object.values(ParticipantTypes).includes(effectiveRole)) {
      return { success: false, errorCode: BAD_REQUEST, message: `role must be one of: ${Object.values(ParticipantTypes).join(", ")}` };
    }

    const fast = await ElicitationModel.findOne({
      _id: fastId,
      projectId,
      isDeleted: false,
      elicitationMode: ElicitationModes.FAST
    });

    if (!fast) {
      return { success: false, errorCode: BAD_REQUEST, message: "FAST meeting not found" };
    }

    const existingParticipant = (fast.participants || []).find((participant) => participant.userId === userId);

    if (existingParticipant && !existingParticipant.isDeleted) {
      return { success: false, errorCode: CONFLICT, message: "Participant already exists in FAST meeting" };
    }

    if (existingParticipant && existingParticipant.isDeleted) {
      existingParticipant.isDeleted = false;
      existingParticipant.removedAt = null;
      existingParticipant.removedBy = null;
      existingParticipant.role = effectiveRole;
      existingParticipant.roleDescription = roleDescription || null;
      fast.updatedBy = addedBy;

      await fast.save();

      return {
        success: true,
        errorCode: OK,
        data: { fast, participant: existingParticipant }
      };
    }

    fast.participants.push({
      userId,
      role: effectiveRole,
      roleDescription: roleDescription || null,
      addedBy,
      addedAt: new Date(),
      isDeleted: false
    });
    fast.updatedBy = addedBy;

    await fast.save();

    return {
      success: true,
      errorCode: OK,
      data: { fast, participant: fast.participants[fast.participants.length - 1] }
    };
  } catch (error) {
    logWithTime(`❌ [addFastMemberService] ${error.message}`);
    return { success: false, errorCode: INTERNAL_ERROR, message: "Internal error while adding FAST participant" };
  }
};

module.exports = { addFastMemberService };
