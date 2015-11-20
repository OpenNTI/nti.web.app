Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outlinenode',

	requires: [
		'NextThought.app.course.overview.components.editing.outlinenode.Preview'
	],

	cls: 'outline-node-editing',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'overview-editing-outlinenode-preview',
				outlineNode: this.outlineNode
			}
		]);
	}
});
