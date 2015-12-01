Ext.define('NextThought.app.course.overview.components.editing.contentnode.Index', {
	extend: 'NextThought.app.course.overview.components.editing.calendarnode.Index',
	alias: 'widget.overview-editing-contentnode',

	requires: [
		'NextThought.app.course.overview.components.editing.contentnode.Preview'
	],

	hasItems: false,
	hasContents: true,


	getPreviewConfig: function(outlineNode, bundle) {
		return {
			xtype: 'overview-editing-contentnode-preview',
			outlineNode: outlineNode,
			bundle: bundle
		};
	}
});
