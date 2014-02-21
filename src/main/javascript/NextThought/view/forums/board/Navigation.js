Ext.define('NextThought.view.forums.board.Navigation', {
	extend: 'NextThought.view.forums.hierarchy.Navigation',
	alias: 'widget.forums-board-nav',

	setCurrent: function(record) {
		console.error('Dont know what to do for board navigation', record);
	}
});
