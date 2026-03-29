// services/participants/get-participant.service.js

const { NOT_FOUND, BAD_REQUEST, INTERNAL_ERROR } = require("@configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { AdminModel } = require("@models/admin.model");
const { ClientModel } = require("@models/client.model");

/**
 * Fetches a single participant from a meeting by MongoDB _id
 * Also fetches firstName from Admin/Client models where available
 * 
 * @param {Object} meeting - Meeting document (already validated by middleware)
 * @param {string} participantId - MongoDB _id of the participant (not userId)
 * 
 * @returns {{ success: true, participant } | { success: false, message, errorCode }}
 */
const getParticipantService = async (meeting, participantId) => {
    try {
        logWithTime(`[getParticipantService] Fetching participant ${participantId} from meeting ${meeting._id}`);

        // ── 1. Validate participantId is provided ───────────────────────────
        if (!participantId) {
            logWithTime(`[getParticipantService] ❌ Participant ID not provided`);
            return {
                success: false,
                message: "Participant ID is required",
                errorCode: BAD_REQUEST
            };
        }

        // ── 2. Find participant in meeting.participants array ───────────────
        const participant = meeting.participants.find(
            p => p._id.toString() === participantId && !p.isDeleted
        );

        if (!participant) {
            logWithTime(
                `[getParticipantService] ❌ Participant ${participantId} not found or is deleted in meeting ${meeting._id}`
            );
            return {
                success: false,
                message: `Participant not found`,
                errorCode: NOT_FOUND
            };
        }

        // ── 3. Fetch firstName from Admin/Client models ─────────────────────
        let firstName = null;
        try {
            // Try Admin model first
            let user = await AdminModel.findOne(
                { adminId: participant.userId },
                { firstName: 1 }
            ).lean();

            // If not found, try Client model
            if (!user) {
                user = await ClientModel.findOne(
                    { clientId: participant.userId },
                    { firstName: 1 }
                ).lean();
            }

            firstName = user?.firstName || null;
        } catch (error) {
            logWithTime(
                `⚠️ [getParticipantService] Error fetching name for user ${participant.userId}: ${error.message}`
            );
        }

        const participantWithName = {
            ...participant.toObject ? participant.toObject() : participant,
            firstName: firstName
        };

        logWithTime(
            `[getParticipantService] ✅ Participant found: ${participant.userId} (${participant.role})`
        );

        return {
            success: true,
            participant: participantWithName
        };

    } catch (error) {
        logWithTime(
            `[getParticipantService] ❌ Error fetching participant: ${error.message}`
        );
        return {
            success: false,
            message: "Error fetching participant",
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { getParticipantService };
