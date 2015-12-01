Ext.define('NextThought.app.course.overview.components.editing.video.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-video-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.Video.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.video.Preview',
		'NextThought.model.Video'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'Video'}}
	]
});
