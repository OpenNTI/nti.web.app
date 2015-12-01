Ext.define('NextThought.app.course.overview.components.editing.timeline.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-timeline-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.Timeline.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.timeline.Preview',
		'NextThought.model.Timeline'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'Timeline'}}
	]
});
