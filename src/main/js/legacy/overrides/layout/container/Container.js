const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.overrides.layout.container.Container', {
	override: 'Ext.layout.container.Container',

	manageOverflow: 2
});
