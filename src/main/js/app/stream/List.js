export default Ext.define('NextThought.app.stream.List', {
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


	getPageCount: function() {
		return this.PAGES.length;
	},


	fillInItems: function(items) {
		var config = this.getPageConfig(items);

		// NOTE: Insert instead of add make sure the join-event is always at the last item.
		// Alternatively, when we clearPages, we would delete the join-event cmp and
		// we could just continue using add in this case.
		this.PAGES.push(this.insert(this.PAGES.length, config));
	}
});
