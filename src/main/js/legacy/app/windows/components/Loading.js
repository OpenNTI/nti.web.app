const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.windows.components.Loading', {
	extend: 'Ext.Component',
	alias: 'widget.window-loading',

	cls: 'window-loading',

	renderTpl: Ext.DomHelper.markup({html: 'Loading...'})
});
