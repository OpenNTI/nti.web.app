const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.overrides.data.proxy.Server', {
	override: 'Ext.data.proxy.Server',
	noCache: Ext.isGecko === true,

	setException (operation, response) {
		operation.setException({
			status: response.status,
			statusText: response.statusText,
			responseText: response.responseText,
			responseJson: Ext.decode(response.responseText, true)
		});
	},
});
