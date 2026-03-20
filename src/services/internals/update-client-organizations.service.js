const { logWithTime } = require("@utils/time-stamps.util");
const { isValidCustomId } = require("@utils/id-validators.util");
const { ClientModel } = require("@models/client.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { logServiceTrackerEvent } = require("@services/audit/service-tracker.service");
const { SYSTEM_LOG_EVENTS, STATUS_TYPES, SERVICE_NAMES } = require("@configs/system-log-events.config");
const { ClientTypes, StakeholderDeletionReason } = require("@configs/enums.config");

/**
 * Update Client Organizations Service
 * Updates client's organization memberships
 * Automatically soft-deletes stakeholder roles when organization is removed
 * 
 * @param {string} clientId - The custom client ID (USR format)
 * @param {string} removedOrgId - Organization ID to remove (optional)
 *   → When removed, all stakeholder roles for this client in that org are soft-deleted
 *   → Sets isDeleted:true, deletionReasonType: ORGANIZATION_REMOVED_FROM_CLIENT
 * @param {string} addedOrgId - Organization ID to add (optional)
 * @param {string} adminId - The adminId who executed the update
 * @param {string} requestId - The request ID for tracking
 * @returns {Promise<Object>} - { success: boolean, message: string, data?: Object, type?: string }
 *   → data.softDeletedStakeholders on removal: count of soft-deleted stakeholder roles
 */
const updateClientOrganizationsService = async (
    clientId,
    removedOrgId,
    addedOrgId,
    adminId,
    requestId
) => {
    try {
        // Step 1: Validate clientId format
        if (!clientId || !isValidCustomId(clientId)) {
            logWithTime(`❌ Invalid clientId format: ${clientId}`);
            // ... (ServiceTracker logging)
            return {
                success: false,
                type: "BadRequest",
                message: "Invalid clientId format. Please provide a valid custom ID."
            };
        }

        // Optional Improvement 1: Fast-fail No-op Guard
        // If neither action is requested, return early and save a DB query.
        if (!removedOrgId && !addedOrgId) {
            logWithTime(`ℹ️ No organization changes provided for Client: ${clientId}`);
            return {
                success: true,
                message: "No changes provided."
            };
        }

        // Step 2: Find the client (Mongoose Document)
        const query = { clientId, isDeleted: false };
        logWithTime(`🔍 Searching for Client with clientId: ${clientId}`);
        
        const clientToUpdate = await ClientModel.findOne(query);

        if (!clientToUpdate) {
            logWithTime(`⚠️ Client not found or deleted: ${clientId}`);
            // ... (ServiceTracker logging)
            return {
                success: false,
                type: "Conflict",
                message: "Client not found or deleted."
            };
        }

        // Step 3: Prepare organization update operations in memory
        logWithTime(`📦 Processing organization updates for Client: ${clientId}`);
        const organizationChanges = {};

        if (removedOrgId) {
            clientToUpdate.organizationIds.pull(removedOrgId); 
            organizationChanges.removed = removedOrgId;
            logWithTime(`  ➖ Removing organization: ${removedOrgId}`);

            // Soft delete: Mark stakeholder roles as deleted with reason
            logWithTime(`  🗑️ Soft-deleting stakeholder roles for client ${clientId} in organization ${removedOrgId}`);
            const deleteResult = await StakeholderModel.updateMany(
                {
                    userId: clientId,
                    organizationId: removedOrgId
                },
                {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: adminId,
                    deletionReasonType: StakeholderDeletionReason.ORGANIZATION_REMOVED_FROM_CLIENT,
                    deletionReasonDescription: `Organization ${removedOrgId} was removed from client ${clientId}`
                }
            );
            
            if (deleteResult.modifiedCount > 0) {
                organizationChanges.softDeletedStakeholders = deleteResult.modifiedCount;
                logWithTime(`  ✅ Soft-deleted ${deleteResult.modifiedCount} stakeholder role(s)`);
            }
        }

        if (addedOrgId) {
            clientToUpdate.organizationIds.addToSet(addedOrgId); 
            organizationChanges.added = addedOrgId;
            logWithTime(`  ➕ Adding organization: ${addedOrgId}`);
        }

        // Step 4: Update clientType based on the new array length
        const finalOrgsCount = clientToUpdate.organizationIds.length;

        if (finalOrgsCount === 0) {
            clientToUpdate.clientType = ClientTypes.INDIVIDUAL;
        } else if (finalOrgsCount === 1) {
            clientToUpdate.clientType = ClientTypes.ORGANIZATION;
        } else {
            clientToUpdate.clientType = ClientTypes.MULTI_ORGANIZATION;
        }

        // Optional Improvement 2: Avoid unnecessary save()
        // If the array didn't actually change (e.g., pulling a non-existent ID), skip the write.
        let updatedClient = clientToUpdate;
        let updateOccurred = false;

        if (clientToUpdate.isModified()) {
            updatedClient = await clientToUpdate.save();
            updateOccurred = true;
            logWithTime(`✅ Successfully updated organizations for Client: ${clientId}`);
            
            // Log success to ServiceTracker only if a real update happened
            logServiceTrackerEvent({
                serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
                eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
                action: "UPDATE_CLIENT_ORGANIZATIONS_SUCCESS",
                status: STATUS_TYPES.SUCCESS,
                description: `Client organizations updated for clientId ${clientId}`,
                targetId: clientId,
                executedBy: adminId,
                metadata: {
                    organizationIds: updatedClient.organizationIds || [],
                    changes: organizationChanges,
                    requestId
                }
            });
        } else {
            logWithTime(`ℹ️ No actual changes were made to the DB for Client: ${clientId}`);
        }

        return {
            success: true,
            data: updatedClient,
            message: updateOccurred 
                ? "Client organizations updated successfully." 
                : "No new changes were required for this client."
        };

    } catch (err) {
        logWithTime(`💥 Error in updateClientOrganizationsService: ${err.message}`);
        // ... (ServiceTracker error logging)
        return {
            success: false,
            type: err.name === 'ValidationError' ? "BadRequest" : "InternalServerError",
            message: err.message || "An error occurred while updating client organizations."
        };
    }
};

module.exports = {
    updateClientOrganizationsService
};