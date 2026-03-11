const generateVersion = (cycleNumber, lastVersion) => {

    if (!lastVersion) {
        return `v${cycleNumber}.0`;
    }

    const versionWithoutV = lastVersion.replace("v", "");
    const [major, minor] = versionWithoutV.split(".").map(Number);

    // agar cycle change ho gaya
    if (major !== cycleNumber) {
        return `v${cycleNumber}.0`;
    }

    // same cycle → increment minor
    const nextMinor = minor + 1;

    return `v${cycleNumber}.${nextMinor}`;
}

module.exports = {
    generateVersion
};