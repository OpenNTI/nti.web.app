Ext.define('NextThought.app.stream.List', {
	extend: 'NextThought.app.stream.Base',
	alias: 'widget.stream-list',

	requires: [
		'NextThought.app.stream.components.ListPage'
	],


	cls: 'list-stream',


	getPageConfig: function(items) {
		return {
			xtype: 'stream-list-page',
			records: items
		};
	},


	fillInItems: function(items) {
		var config = this.getPageConfig(items);

		this.PAGES.push(this.add(config));
	}
});
