module.exports = {
    countryCodeRegex: /^[1-9]\d{0,2}$/,
    localNumberRegex: /^\d{9,12}$/,
    phoneNumberRegex: /^\+([1-9]\d{0,2})(\d{9,12})$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    firstNameRegex: /^[a-zA-Z\s'-]+$/,
    UUID_V4_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    mongoIdRegex: /^[a-f\d]{24}$/i,
    // Uniform ID pattern: All users (Admin, Client, User) use USR prefix
    // Differentiation is done via type field in database, not ID prefix
    customIdRegex: /^USR[0-9]{7}$/,
    requestIdRegex: /^REQ[0-9]{10}$/,
    timelineRegex: /^(?:[1-9]|[1-9]\d|1[01]\d|120)$/,
    budgetRegex: /^\d{1,12}$/,
    googleMeetRegex: /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/,
    zoomMeetRegex: /^https:\/\/([a-z0-9-]+\.)?zoom\.us\/j\/\d+(\?pwd=[\w-]+)?$/,
    teamsRegex: /^https:\/\/teams\.microsoft\.com\/l\/meetup-join\/.+$/,
    isoDateRegex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
    tagRegex: /^[a-z0-9_-]{2,30}$/,
    acceptanceCriteriaRegex: /^(?=.*[a-zA-Z0-9])[\s\S]{20,2000}$/
}