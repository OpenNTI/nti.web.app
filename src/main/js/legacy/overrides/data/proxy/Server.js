const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.overrides.data.proxy.Server', {
	override: 'Ext.data.proxy.Server',
	noCache: Ext.isGecko === true
});
