Ext.define('NextThought.app.course.overview.components.editing.contentnode.Window', {
	extend: 'NextThought.app.course.overview.components.editing.calendarnode.Window',
	alias: 'widget.overview-editing-contentnode-window',

	requires: [
		'NextThought.app.course.overview.components.editing.contentnode.Editor'
	],

	headerTitle: 'Content Node Editor',


	showOutlineNode: function(outlineNode) {
		this.add({
			xtype: 'overview-editing-contentnode-editor',
			outlineNode: outlineNode
		});
	}

}, function() {
	NextThought.app.windows.StateStore.register('edit-contentnode', this);
});
