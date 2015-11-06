Ext.define('NextThought.app.course.overview.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-body',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.Lesson',
		'NextThought.app.course.overview.components.Editor'
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
				onEdit: this.edit.bind(this)
			});

			this.addChildRouter(lesson);
		}

		return lesson;
	},


	getEditor: function(addIfNotThere) {
		var editor = this.down('course-overview-editor');

		if (!editor && addIfNotThere) {
			editor = this.add({
				xtype: 'course-overview-editor',
				bundle: this.currentBundle,
				onDoneEditing: this.doneEditing.bind(this)
			});

			this.addChildRouter(editor);
		}

		return editor;
	},


	setActiveBundle: function(bundle) {
		var lesson = this.down('course-overview-lesson'),
			editor = this.down('course-overview-editor');

		if (lesson) {
			lesson.setActiveBundle(bundle);
		}

		if (editor) {
			editor.setActiveBundle(bundle);
		}

		this.currentBundle = bundle;
	},


	showLesson: function(record) {
		var lesson = this.getLesson(),
			editor = this.getEditor();

		if (editor) {
			editor.hide();
		}

		lesson.show();

		return lesson.renderLesson(record);
	},


	editLesson: function(record) {
		var editor = this.getEditor(true),
			lesson = this.getLesson();

		editor.show();
		lesson.hide();

		return editor.editLesson(record);
	},


	edit: function(id) {
		if (this.onEdit) {
			this.onEdit(id);
		}
	},


	doneEditing: function(id) {

	}
});
