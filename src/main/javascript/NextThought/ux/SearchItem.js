Ext.define('NextThought.ux.SearchItem', {
	extend: 'NextThought.view.form.fields.SimpleTextField',
	alias: 'widget.search-menu-item',

	ui: 'nt',
	cls: 'search-box',

	constructor: function(config) {
		config.type = 'text';
		this.callParent(arguments);
	},

	afterRender: function() {
		this.callParent(arguments);
		this.inputEl.set({size: 13});
	}
});
