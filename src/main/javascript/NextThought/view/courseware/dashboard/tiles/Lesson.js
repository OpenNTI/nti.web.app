Ext.define('NextThought.view.courseware.dashboard.tiles.Lesson', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
	alias: 'widget.dashboard-lesson',

	cls: 'lesson-tile',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Lesson Available'},
		{cls: 'title', html: '{title}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.lesson.get('title')
		});
	}
});