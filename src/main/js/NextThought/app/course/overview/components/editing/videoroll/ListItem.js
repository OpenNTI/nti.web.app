Ext.define('NextThought.app.course.overview.components.editing.videoroll.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-videoroll-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.VideoRoll.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.videoroll.Preview',
		'NextThought.model.VideoRoll'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'VideoRoll'}}
	]
});
