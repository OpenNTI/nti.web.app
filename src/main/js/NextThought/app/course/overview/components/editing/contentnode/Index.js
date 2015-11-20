Ext.define('NextThought.app.course.overview.components.editing.contentnode.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-contentnode',

	requires: [
		'NextThought.app.course.overview.components.editing.contentnode.Preview'
	],

	cls: 'outline-node-editing',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'overview-editing-contentnode-preview',
				outlineNode: this.outlineNode
			}
		]);
	}
});
