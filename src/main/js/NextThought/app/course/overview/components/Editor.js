Ext.define('NextThought.app.course.overview.components.Editor', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-editor',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [
		{
			xtype: 'box',
			autoEl: {html: 'Editing'}
		}
	],


	editLesson: function(record) {
		return Promise.resolve();
	}
});
