Ext.define('NextThought.app.course.overview.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-body',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.Lesson',
		'NextThought.app.course.overview.components.editing.Outline',
		'NextThought.app.course.overview.components.editing.Lesson'
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
				bundle: this.currentBundle,
				onEditLesson: this.edit.bind(this)
			});

			this.addChildRouter(lesson);
		}

		return lesson;
	},


	setActiveBundle: function(bundle) {
		var lesson = this.getLesson();

		if (lesson) {
			lesson.setActiveBundle(bundle);
		}

		this.currentBundle = bundle;
	},


	showLesson: function(record) {
		var lesson = this.getLesson();

		return lesson.renderLesson(record);
	},


	edit: function(id) {
		if (this.onEditLesson) {
			this.onEditLesson(id);
		}
	},


	doneEditing: function(id) {

	}
});
