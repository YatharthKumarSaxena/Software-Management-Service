/**
 * Internal Client Exports
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-04
 */

const guard = require('../microservice.guard');
if (!guard) {
    module.exports = null;
    return;
}

const authClient = require('./custom-auth-service.client');
const adminPanelClient = require('./admin-panel.client');

module.exports = {
    authClient,
    adminPanelClient
};