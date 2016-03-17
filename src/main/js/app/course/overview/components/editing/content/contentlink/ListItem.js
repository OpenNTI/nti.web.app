export default Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
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

	canEdit: true,


	getPreviewType: function(record) {
		return 'course-overview-content';
	},


	getControls: function(record, bundle) {
		var config = this.callParent(arguments),
			items = config.items || [],
			visibility = record && record.get('visibility');

		if (visibility !== 'everyone') {
			items.unshift({
				xtype: 'box',
				record: record,
				autoEl: {
					cls: 'visibility', html: visibility
				}
			});
		}
		
		config.items = items;
		return config;
	}
});
