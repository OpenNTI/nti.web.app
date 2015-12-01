Ext.define('NextThought.app.course.overview.components.editing.calendarnode.Index', {
	extend: 'NextThought.app.course.overview.components.editing.outlinenode.Index',
	alias: 'widget.overview-editing-calenarnode',

	requires: [
		'NextThought.app.course.overview.components.editing.calendarnode.Preview'
	],

	hasItems: true,
	hasContents: false,

	cls: 'outline-node-editing',

	getPreviewConfig: function(outlineNode, bundle) {
		return {
			xtype: 'overview-editing-calendarnode-preview',
			outlineNode: outlineNode,
			bundle: bundle
		};
	}
});
