Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Window', {
	extend: 'NextThought.app.course.overview.components.editing.Window',
	alias: 'widget.overview-editing-outlinenode-window',

	requires: [
		'NextThought.app.course.overview.components.editing.outlinenode.Editor'
	],

	newItemText: 'New Unit',

	getEditorConfig: function() {
		return {
			xtype: 'overview-editing-outlinenode-editor'
		};
	}
}, function() {
	NextThought.app.windows.StateStore.register('edit-outlinenode', this);
});
