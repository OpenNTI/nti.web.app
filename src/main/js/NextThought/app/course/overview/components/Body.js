Ext.define('NextThought.app.course.overview.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-body',

	requires: [
		'NextThought.app.course.overview.components.Lesson'
	],

	layout: 'none',

	clear: function(){
		this.removeAll(true);
	},


	setActiveBundle: function(bundle) {
		this.currentBundle = bundle;
	},


	showLesson: function(record) {
		this.clear();

		var lesson = this.add({
			xtype: 'course-overview-lesson',
			bundle: this.currentBundle
		});

		return lesson.renderLesson(record);
	}
});