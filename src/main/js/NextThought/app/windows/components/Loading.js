export default Ext.define('NextThought.app.windows.components.Loading', {
	extend: 'Ext.Component',
	alias: 'widget.window-loading',

	cls: 'window-loading',

	renderTpl: Ext.DomHelper.markup({html: 'Loading...'})
});
