Ext.define('NextThought.app.course.overview.components.editing.contentlink.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-contentlink-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.RelatedWork.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Preview',
		'NextThought.model.RelatedWork'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'ContentLink'}}
	]
});
