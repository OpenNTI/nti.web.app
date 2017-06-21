const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.menu.Menu', {
	override: 'Ext.menu.Menu',

	ui: 'nt',

	plain: true,

	showSeparator: false,

	shadow: false,

	frame: false,

	hideMode: 'display'
});
