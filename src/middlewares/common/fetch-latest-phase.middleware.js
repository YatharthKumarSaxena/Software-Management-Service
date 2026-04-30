const { throwDBResourceNotFoundError, getLogIdentifiers, throwSpecificInternalServerError, logMiddlewareError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

// ── Models Import (No Lazy Loading) ───────────────────────────────────────
const { InceptionModel } = require('@/models/inception.model');
const { ElicitationModel } = require('@/models/elicitation.model');
const { ElaborationModel } = require('@/models/elaboration.model');
const { NegotiationModel } = require('@/models/negotiation.model');
const { SpecificationModel } = require('@/models/specification.model');
const { ValidationModel } = require('@/models/validation.model');
const { Phases } = require("@/configs/enums.config");

// ── 1. The Mapping Dictionary ─────────────────────────────────────────────
const PHASE_TO_MODEL_MAP = {
    [Phases.INCEPTION]: InceptionModel,
    [Phases.ELICITATION]: ElicitationModel,
    [Phases.ELABORATION]: ElaborationModel,
    [Phases.NEGOTIATION]: NegotiationModel,
    [Phases.SPECIFICATION]: SpecificationModel,
    [Phases.VALIDATION]: ValidationModel
};

/**
 * Middleware to dynamically fetch multiple latest entities based on Phase Enums
 * 
 * @param {Array<string>} phases - Array of Phase Enums (e.g., ['NEGOTIATION', 'ELICITATION'])
 * @param {boolean} isRequired - Agar true hai, toh 404 fekega agar ek bhi doc na mile
 */
const fetchLatestPhasesMiddleware = (phases = [], isRequired = true) => {
    return async (req, res, next) => {
        try {
            // 1. Extract Project ID directly from req.project
            const projectId = req.project?._id;

            if (!projectId) {
                logMiddlewareError(`fetchLatestPhases`, `Project Id is missing`, req);
                return throwSpecificInternalServerError(res, "Project context is missing in the request.");
            }

            // 2. Fetch all requested phases concurrently
            const fetchPromises = phases.map(async (phaseName) => {
                const upperPhase = phaseName.toUpperCase();
                
                const Model = PHASE_TO_MODEL_MAP[upperPhase];

                if (!Model) {
                    throw new Error(`Invalid phase requested: ${upperPhase}`);
                }
                
                // Smart Query: Inception uses version.major, others use createdAt
                const sortQuery = upperPhase === Phases.INCEPTION 
                    ? { "version.major": -1 } 
                    : { createdAt: -1 };

                const latestDoc = await Model.findOne({
                    projectId: projectId,
                    isDeleted: false
                })
                .sort(sortQuery)
                .lean();

                const reqKey = phaseName.toLowerCase(); 
                
                return { reqKey, upperPhase, doc: latestDoc };
            });

            const results = await Promise.all(fetchPromises);

            // 3. Apply OR Guard & Attach to Request
            let anyDocFound = false;

            for (const { reqKey, doc } of results) {
                if (doc) {
                    anyDocFound = true; // Agar ek bhi mil gaya, toh flag true ho jayega
                }
                // Hamesha req pe attach karo, chahe doc ho ya null
                req[reqKey] = doc || null;
            }

            // Agar isRequired true hai aur EK BHI document nahi mila, tab error throw hoga
            if (isRequired && !anyDocFound) {
                logWithTime(`⚠️ No active documents found for ANY of the requested phases [${phases.join(', ')}] for project: ${projectId}`);
                return throwDBResourceNotFoundError(res, `No Valid Phase found to perform this action`);
            }

            req.projectId = projectId;

            logWithTime(`✅ Successfully attached: ${results.map(r => `req.${r.reqKey}`).join(', ')} | ${getLogIdentifiers(req)}`);
            return next();

        } catch (error) {
            logWithTime(`❌ Error in fetchLatestPhasesMiddleware: ${error.message} | ${getLogIdentifiers(req)}`);
            if (error.message.includes('Invalid phase')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            return throwDBResourceNotFoundError(res, "Requested Phases");
        }
    };
};

module.exports = { fetchLatestPhasesMiddleware, PHASE_TO_MODEL_MAP };