/**
 * Service Token Module Exports
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-04
 */

const guard = require('../microservice.guard');
if (!guard) {
    module.exports = null;
    return;
}

module.exports = {
    ...require('./token.generator'),
    ...require('./token.store'),
    ...require('./token.rotator')
};