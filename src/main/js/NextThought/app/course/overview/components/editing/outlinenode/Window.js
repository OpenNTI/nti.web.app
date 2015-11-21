Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outlinenode-window',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading',
		'NextThought.app.course.overview.components.editing.outlinenode.Editor'
	],


	layout: 'none',
	items: [],

	headerTitle: 'Outline Node Editing',


	initComponent: function() {
		this.callParent(arguments);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.doClose.bind(this)
		});

		this.headerCmp.setTitle(this.headerTitle);

		if (this.precache.outlineNode) {
			this.showOutlineNode(this.precache.outlineNode);
		}
	},


	showOutlineNode: function(outlineNode) {
		this.add({
			xtype: 'overview-editing-outlinenode-editor',
			outlineNode: outlineNode
		});
	}
}, function() {
	NextThought.app.windows.StateStore.register('edit-outlinenode', this);
});
