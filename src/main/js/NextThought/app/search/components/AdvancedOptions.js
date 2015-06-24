Ext.define('NextThought.app.search.components.AdvancedOptions', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.search-advanced-menu',

	requires: [
		'NextThought.common.menus.LabeledSeparator'
	],

	minWidth: 200,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			beforecheckchange: function(item, checked) { return checked || item.allowUncheck !== false; }
		}
	}
});
