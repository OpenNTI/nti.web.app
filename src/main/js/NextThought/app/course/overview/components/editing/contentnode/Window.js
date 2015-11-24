Ext.define('NextThought.app.course.overview.components.editing.contentnode.Window', {
	extend: 'NextThought.app.course.overview.components.editing.Window',
	alias: 'widget.overview-editing-contentnode-window',

	requires: [
		'NextThought.app.course.overview.components.editing.contentnode.Editor'
	],

	newItemText: 'New Lesson',

	getEditorConfig: function() {
		return {
			xtype: 'overview-editing-contentnode-editor'
		};
	}

}, function() {
	NextThought.app.windows.StateStore.register('edit-contentnode', this);
});
