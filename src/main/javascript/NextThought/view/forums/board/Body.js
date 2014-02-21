Ext.define('NextThought.view.forums.board.Body', {
	extend: 'NextThought.view.forums.hierarchy.Body',
	alias: 'widget.forums-board-body',

	cls: 'forum-body scroll-content',

	require: [
		'NextThought.view.forums.old.Root'
	],


	setCurrent: function(store) {
		if (!store) { return; }

		this.add({xtype: 'forums-board-list', store: store});
	}
});
