/**
 * Filter meeting data based on user type
 * 
 * Admin users (with adminId): See all fields
 * Client users (without adminId): See only relevant fields
 * 
 * @param {Object|Array} meetings - Single meeting or array of meetings
 * @param {boolean} isAdmin - Whether user is admin (has adminId)
 * @returns {Object|Array} Filtered meeting data
 */
const filterMeetingDataByUserType = (meetings, isAdmin) => {
  if (!meetings) return meetings;

  // If user is admin, return all data
  if (isAdmin) {
    return meetings;
  }

  // For clients, filter to relevant fields only
  const filterSingle = (meeting) => {
    if (!meeting) return meeting;

    const meetingObj = meeting.toObject ? meeting.toObject() : meeting;

    return {
      _id: meetingObj._id,
      title: meetingObj.title,
      description: meetingObj.description,
      entityId: meetingObj.entityId,
      entityType: meetingObj.entityType,
      projectId: meetingObj.projectId,
      platform: meetingObj.platform,
      status: meetingObj.status,
      scheduledAt: meetingObj.scheduledAt,
      startedAt: meetingObj.startedAt,
      endedAt: meetingObj.endedAt,
      meetingLink: meetingObj.meetingLink,
      // Don't include meetingPassword for clients
      meetingGroup: meetingObj.meetingGroup,
      facilitatorId: meetingObj.facilitatorId,
      // Include only relevant participant info
      participants: meetingObj.participants
        ? meetingObj.participants
            .filter(p => !p.isDeleted) // Hide deleted participants
            .map(p => ({
              userId: p.userId,
              role: p.role,
              roleDescription: p.roleDescription
              // Don't include addedBy, updatedBy, removedBy, removedAt for clients
            }))
        : [],
      isScheduleFrozen: meetingObj.isScheduleFrozen,
      createdAt: meetingObj.createdAt,
      updatedAt: meetingObj.updatedAt
      // Don't include:
      // - createdBy, updatedBy (audit fields)
      // - cancelledAt, cancelledBy, cancelReason, cancelDescription (admin only)
    };
  };

  // Handle both single meeting and array of meetings
  if (Array.isArray(meetings)) {
    return meetings.map(filterSingle);
  }

  return filterSingle(meetings);
};

/**
 * Filter participant data based on user type
 * 
 * Admin users (with adminId): See all fields
 * Client users (without adminId): See only relevant fields
 * 
 * @param {Object|Array} participants - Single participant or array of participants
 * @param {boolean} isAdmin - Whether user is admin (has adminId)
 * @returns {Object|Array} Filtered participant data
 */
const filterParticipantDataByUserType = (participants, isAdmin) => {
  if (!participants) return participants;

  // If user is admin, return all data
  if (isAdmin) {
    return participants;
  }

  // For clients, filter to relevant fields only
  const filterSingle = (participant) => {
    if (!participant) return participant;

    const participantObj = participant.toObject ? participant.toObject() : participant;

    // Use firstName if available, otherwise use generic display name
    const displayName = participantObj.firstName || `User (${participantObj.userId})`;

    return {
      userId: participantObj.userId,
      displayName: displayName,
      role: participantObj.role,
      roleDescription: participantObj.roleDescription
      // Don't include:
      // - _id (internal db reference)
      // - firstName (internal field)
      // - addedBy, updatedBy, removedBy (audit fields)
      // - isDeleted, removedAt (audit fields)
      // - timestamps (createdAt, updatedAt)
    };
  };

  // Handle both single participant and array of participants
  if (Array.isArray(participants)) {
    return participants.map(filterSingle);
  }

  return filterSingle(participants);
};

module.exports = { filterMeetingDataByUserType, filterParticipantDataByUserType };
