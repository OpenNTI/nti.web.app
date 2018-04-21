const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.windows.components.Container', {
	extend: 'Ext.container.Container',
	alias: 'widget.window-container',

	layout: 'none',

	cls: 'window-content'
});
