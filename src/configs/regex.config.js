module.exports = {
    countryCodeRegex: /^[1-9]\d{0,2}$/,
    localNumberRegex: /^\d{9,12}$/,
    phoneNumberRegex: /^\+([1-9]\d{0,2})(\d{9,12})$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    firstNameRegex: /^[a-zA-Z\s'-]+$/,
    UUID_V4_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    mongoIdRegex: /^[a-f\d]{24}$/i,
    adminIdRegex: /^ADM[0-9]{7}$/,
    clientIdRegex: /^CLT[0-9]{7}$/,
    userIdRegex: /^USR[0-9]{7}$/,
    requestIdRegex: /^REQ[0-9]{10}$/
}