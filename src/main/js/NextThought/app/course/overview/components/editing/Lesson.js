Ext.define('NextThought.app.course.overview.components.editing.Lesson', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-lesson',

	layout: 'none',

	items: [
		{
			xtype: 'box',
			autoEl: {html: 'Lesson Editor'}
		}
	],


	setActiveBundle: function(bundle) {},

	editLesson: function() {
		return Promise.resolve();
	}
});
