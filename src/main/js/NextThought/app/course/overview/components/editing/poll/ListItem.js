Ext.define('NextThought.app.course.overview.components.editing.poll.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-poll-listitem',

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	statics: {
		getSupported: function() {
			return NextThought.model.PollRef.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Preview',
		'NextThought.model.PollRef'
	],

	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'Poll'}}
	]
});
