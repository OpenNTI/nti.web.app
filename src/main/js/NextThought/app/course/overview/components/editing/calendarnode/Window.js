Ext.define('NextThought.app.course.overview.components.editing.calendarnode.Window', {
	extend: 'NextThought.app.course.overview.components.editing.outlinenode.Window',
	alias: 'widget.overview-editing-calendarnode-window',

	requires: [
		'NextThought.app.course.overview.components.editing.calendarnode.Editor'
	],


	headerTitle: 'Calendar Outline Node Editing',

	showOutlineNode: function(outlineNode) {
		this.add({
			xtype: 'overview-editing-calendarnode-editor',
			outlineNode: outlineNode
		});
	}

}, function() {
	NextThought.app.windows.StateStore.register('edit-calendarnode', this);
});
