Ext.define('NextThought.view.forums.board.View', {
	extend: 'NextThought.view.forums.hierarchy.View',
	alias: 'widget.forums-board-view',

	requires: [
		'NextThought.view.forums.board.Body',
		'NextThought.view.forums.board.Navigation'
	],

	navigation: { xtype: 'forums-board-nav'},
	body: { xtype: 'forums-board-body'},


	setCurrent: function(record) {
		this.currentRecord = record;

		this.navigation.setCurrent(record);
		this.body.setCurrent(record);
	}
});
