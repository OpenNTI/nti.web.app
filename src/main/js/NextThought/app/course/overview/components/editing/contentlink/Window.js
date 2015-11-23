Ext.define('NextThought.app.course.overview.components.editing.contentlink.Window', {
	extend: 'NextThought.app.course.overview.components.editing.Window',
	alias: 'widget.editing-contentlink-window',

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Editor'
	],

	newItemText: 'New Content Link',

	editRecord: function(record) {
	}
}, function() {
	NextThought.app.windows.StateStore.register('edit-contentlink', this);
});
