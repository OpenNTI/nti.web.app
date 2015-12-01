Ext.define('NextThought.app.course.overview.components.editing.discussion.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-discussion-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.DiscussionRef.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.discussion.Preview',
		'NextThought.model.DiscussionRef'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'Discussion'}}
	]
});
