const { CONFLICT } = require("@configs/http-status.config");

const resolveActivePhase = ({
    activePhases = [],
    supportedPhases = [],
    selectedPhase = null
}) => {

    const validPhases = activePhases.filter(
        phase => supportedPhases.includes(phase)
    );

    if (validPhases.length === 0) {
        return {
            success: false,
            errorCode: CONFLICT,
            message: "No supported phase is currently active"
        };
    }

    if (validPhases.length === 1) {
        return {
            success: true,
            phase: validPhases[0]
        };
    }

    if (!selectedPhase) {
        return {
            success: false,
            errorCode: CONFLICT,
            message: `Multiple supported phases are active. Please specify one of: ${validPhases.join(", ")}`
        };
    }

    if (!validPhases.includes(selectedPhase)) {
        return {
            success: false,
            errorCode: CONFLICT,
            message: `Specified phase must be one of: ${validPhases.join(", ")}`
        };
    }

    return {
        success: true,
        phase: selectedPhase
    };
};

module.exports = {
    resolveActivePhase
};