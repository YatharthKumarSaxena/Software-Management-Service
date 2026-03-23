// services/high-level-features/get-hlf.service.js

/**
 * Admin/full view of a high-level feature record.
 *
 * @param {Object} hlf
 * @returns {{ success: boolean, hlf?: Object, message?: string, error?: string }}
 */
const getHlfAdminService = async (hlf) => {
  try {
    const hlfData = hlf?.toObject ? hlf.toObject() : hlf;
    return { success: true, hlf: hlfData };
  } catch (error) {
    return { success: false, message: "Internal error while fetching high-level feature", error: error.message };
  }
};

/**
 * Restricted HLF view for client/stakeholder access.
 * Filters out sensitive audit fields.
 *
 * @param {Object} hlf
 * @returns {{ success: boolean, hlf?: Object, message?: string, error?: string }}
 */
const getHlfClientService = async (hlf) => {
  try {
    const hlfData = hlf?.toObject ? hlf.toObject() : hlf;

    return {
      success: true,
      hlf: {
        hlfId: hlfData._id,
        title: hlfData.title,
        description: hlfData.description,
        createdAt: hlfData.createdAt,
      },
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching high-level feature", error: error.message };
  }
};

module.exports = {
  getHlfAdminService,
  getHlfClientService,
};
