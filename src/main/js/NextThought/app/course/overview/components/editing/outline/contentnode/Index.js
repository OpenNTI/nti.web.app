Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.Index', {
	extend: 'NextThought.app.course.overview.components.editing.outline.calendarnode.Index',
	alias: 'widget.overview-editing-contentnode',

	statics: {
		getSupported: function() {
			return NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType;
		}
	},

	hasItems: false,
	hasContents: true,

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.outline.contentnode.Preview'
	],


	getPreviewConfig: function(record, bundle) {
		return {
			xtype: 'overview-editing-outline-contentnode-preview',
			record: record,
			bundle: bundle
		};
	}
});
