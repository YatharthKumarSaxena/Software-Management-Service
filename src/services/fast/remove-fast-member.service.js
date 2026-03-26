const { ElicitationModel } = require("@models/elicitation.model");
const { ElicitationModes } = require("@configs/enums.config");
const { customIdRegex } = require("@configs/regex.config");
const { OK, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");

const removeFastMemberService = async ({ fastId, projectId, userId, removedBy }) => {
  try {
    if (!customIdRegex.test(userId || "")) {
      return { success: false, errorCode: BAD_REQUEST, message: "Invalid userId format" };
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

    if (!existingParticipant || existingParticipant.isDeleted) {
      return { success: false, errorCode: BAD_REQUEST, message: "Participant does not exist in FAST meeting" };
    }

    existingParticipant.isDeleted = true;
    existingParticipant.removedBy = removedBy;
    existingParticipant.removedAt = new Date();
    fast.updatedBy = removedBy;

    await fast.save();

    return {
      success: true,
      errorCode: OK,
      data: { fast, participant: existingParticipant }
    };
  } catch (error) {
    logWithTime(`❌ [removeFastMemberService] ${error.message}`);
    return { success: false, errorCode: INTERNAL_ERROR, message: "Internal error while removing FAST participant" };
  }
};

module.exports = { removeFastMemberService };
