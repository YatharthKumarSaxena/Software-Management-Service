/**
 * Microservice Guard
 * 
 * This guard ensures that the entire /internal module returns null
 * when MAKE_IT_MICROSERVICE is disabled.
 * 
 * This allows safe deletion of the /internal folder without breaking
 * the monolithic application.
 * 
 * @author Custom Admin Panel Service Team
 * @date 2026-03-05
 */

if (!process.env.MAKE_IT_MICROSERVICE || process.env.MAKE_IT_MICROSERVICE !== 'true') {
    module.exports = null;
    return;
}

module.exports = {
    isMicroserviceMode: () => true
};
