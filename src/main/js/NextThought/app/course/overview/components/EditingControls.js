Ext.define('NextThought.app.course.overview.components.EditingControls', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-editing-controls',

	renderTpl: Ext.DomHelper.markup({
		html: 'Editing Controls'
	}),


	editLesson: function(record) {
		return Promise.resolve();
	}
});
