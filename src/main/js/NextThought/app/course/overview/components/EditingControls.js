Ext.define('NextThought.app.course.overview.components.EditingControls', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-editing-controls',

	cls: 'editing-controls',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'buttons', cn: [
			{cls: 'button edit', html: 'Edit'}
		]}
	]),


	editLesson: function(record) {
		return Promise.resolve();
	}
});
