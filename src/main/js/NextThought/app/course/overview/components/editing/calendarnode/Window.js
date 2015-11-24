Ext.define('NextThought.app.course.overview.components.editing.calendarnode.Window', {
	extend: 'NextThought.app.course.overview.components.editing.Window',
	alias: 'widget.overview-editing-calendarnode-window',

	requires: [
		'NextThought.app.course.overview.components.editing.calendarnode.Editor'
	],

	newItemText: 'New Section',

	getEditorConfig: function(outlineNode) {
		return {
			xtype: 'overview-editing-calendarnode-editor'
		};
	}

}, function() {
	NextThought.app.windows.StateStore.register('edit-calendarnode', this);
});
