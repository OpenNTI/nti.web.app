Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Window', {
	extend: 'NextThought.app.course.overview.components.editing.Window',
	alias: 'widget.overview-editing-outlinenode-window',

	requires: [
		'NextThought.app.course.overview.components.editing.outlinenode.Editor'
	],

	newItemText: 'New Unit',

	editRecord: function(outlineNode) {
		this.add({
			xtype: 'overview-editing-outlinenode-editor',
			outlineNode: outlineNode
		});
	}
}, function() {
	NextThought.app.windows.StateStore.register('edit-outlinenode', this);
});
