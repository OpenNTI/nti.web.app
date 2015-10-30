Ext.define('NextThought.app.course.overview.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-body',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.Lesson'
	],

	layout: 'none',

	clear: function() {
		this.removeAll(true);
	},


	getLesson: function() {
		var lesson = this.down('course-overview-lesson');

		if (!lesson) {
			lesson = this.add({
				xtype: 'course-overview-lesson',
				bundle: this.currentBundle
			});

			this.addChildRouter(lesson);
		}

		return lesson;
	},


	setActiveBundle: function(bundle) {
		var lesson = this.down('course-overview-lesson');

		if (lesson) {
			lesson.setActiveBundle(bundle);
		}

		this.currentBundle = bundle;
	},


	showLesson: function(record) {
		var lesson = this.getLesson();

		return lesson.renderLesson(record);
	}
});
