Ext.define('NextThought.app.course.overview.components.editing.calendarnode.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-calenarnode',

	requires: [
		'NextThought.app.course.overview.components.editing.calendarnode.Preview'
	],

	cls: 'outline-node-editing',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'overview-editing-calendarnode-preview',
				outlineNode: this.outlineNode
			}
		]);
	}
});
