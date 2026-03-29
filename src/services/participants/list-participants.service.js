// services/participants/list-participants.service.js

const { INTERNAL_ERROR } = require("@/configs/http-status.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { AdminModel } = require("@models/admin.model");
const { ClientModel } = require("@models/client.model");
const { errorMessage } = require("@/utils/log-error.util");

/**
 * Fetches all active (non-deleted) participants from a meeting
 * Also fetches firstName from Admin/Client models where available
 * 
 * @param {Object} foundMeeting - Meeting document (already validated by middleware)
 * 
 * @returns {{ success: true, participants } | { success: false, message, errorCode }}
 */
const listParticipantsService = async (foundMeeting) => {
    try {

        logWithTime(
            `[listParticipantsService] Fetching all participants for meeting ${foundMeeting._id}`
        );

        // ── 1. Filter active (non-deleted) participants ──────────────────────
        const participants = foundMeeting.participants.filter(p => !p.isDeleted);

        // ── 2. Fetch firstName for each participant ────────────────────────
        const participantsWithNames = await Promise.all(
            participants.map(async (p) => {
                try {
                    // Try to find in Admin model first
                    let user = await AdminModel.findOne(
                        { adminId: p.userId },
                        { firstName: 1 }
                    ).lean();

                    // If not found, try Client model
                    if (!user) {
                        user = await ClientModel.findOne(
                            { clientId: p.userId },
                            { firstName: 1 }
                        ).lean();
                    }

                    return {
                        ...p.toObject ? p.toObject() : p,
                        firstName: user?.firstName || null
                    };
                } catch (error) {
                    logWithTime(
                        `⚠️ [listParticipantsService] Error fetching name for user ${p.userId}: ${error.message}`
                    );
                    return {
                        ...p.toObject ? p.toObject() : p,
                        firstName: null
                    };
                }
            })
        );

        logWithTime(
            `[listParticipantsService] ✅ Found ${participantsWithNames.length} active participant(s) in meeting ${foundMeeting._id}`
        );

        return {
            success: true,
            participants: participantsWithNames,
            count: participantsWithNames.length
        };

    } catch (error) {
        logWithTime(
            `[listParticipantsService] ❌ Error fetching participants: ${error.message}`
        );
        errorMessage(error);
        return {
            success: false,
            message: "Error fetching participants",
            errorCode: INTERNAL_ERROR
        };
    }
};

module.exports = { listParticipantsService };
