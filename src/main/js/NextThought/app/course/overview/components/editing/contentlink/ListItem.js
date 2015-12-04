Ext.define('NextThought.app.course.overview.components.editing.contentlink.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.ListItem',
	alias: 'widget.overview-editing-contentlink-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.RelatedWork.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.ContentLink',
		'NextThought.model.RelatedWork'
	],


	getPreviewType: function(record) {
		return 'course-overview-content';
	},


	showEdit: function() {
		this.WindowActions.showWindow('overview-editing', null, null, {}, {record: this.record});
	}
});
