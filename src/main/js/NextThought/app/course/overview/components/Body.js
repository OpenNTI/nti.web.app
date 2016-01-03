Ext.define('NextThought.app.course.overview.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-body',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.EditingControls',
		'NextThought.app.course.overview.components.Lesson',
		'NextThought.app.course.overview.components.editing.Index'
	],

	layout: 'none',

	items: [
		{xtype: 'course-overview-editing-controls'}
	],


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.editingControlsCmp = me.down('course-overview-editing-controls');

		me.editingControlsCmp.openEditing = function() {
			if (me.openEditing) {
				me.openEditing();
			}
		};

		me.editingControlsCmp.closeEditing = function() {
			if (me.closeEditing) {
				me.closeEditing();
			}
		};

		me.editingControlsCmp.hide();
	},


	showEditControls: function() {
		if (this.hasEditingControls) { return; }

		this.addCls('has-editing-controls');
		this.hasEditingControls = true;
		this.editingControlsCmp.show();
		this.editingControlsCmp.showNotEditing();

		if (this.isEditing) {
			this.showEditing();
		} else {
			this.showNotEditing();
		}
	},


	hideEditControls: function() {
		this.removeCls('has-editing-controls');
		delete this.hasEditingControls;
		this.editingControlsCmp.clearButtons();
		this.editingControlsCmp.hide();
	},


	showEditing: function() {
		this.isEditing = true;

		if (this.hasEditingControls) {
			this.editingControlsCmp.showEditing();
		}
	},


	showNotEditing: function() {
		delete this.isEditing;

		if (this.hasEditingControls) {
			this.editingControlsCmp.showNotEditing();
		}
	},


	clear: function() {
		var lesson = this.down('course-overview-lesson');

		if (lesson) {
			lesson.destroy();
		}
	},


	getLesson: function(addIfNotThere) {
		var lesson = this.down('course-overview-lesson[isLessonView]');

		if (!lesson && addIfNotThere) {
			lesson = this.add({
				xtype: 'course-overview-lesson',
				bundle: this.currentBundle
			});

			this.addChildRouter(lesson);
		}

		return lesson;
	},


	getEditor: function(addIfNotThere) {
		var editor = this.down('overview-editing');

		if (!editor && addIfNotThere) {
			editor = this.add({
				xtype: 'overview-editing',
				bundle: this.currentBundle,
				navigateToOutlineNode: this.navigateToOutlineNode
			});

			this.addChildRouter(editor);
		}

		return editor;
	},


	getLessonTop: function() {
		var lesson = this.getLesson(),
			editor = this.getEditor(),
			rect;

		if (lesson && lesson.isVisible()) {
			rect = lesson && lesson.el && lesson.el.dom && lesson.el.dom.getBoundingClientRect();
		} else if (editor && editor.isVisible()) {
			rect = editor && editor.el && editor.el.dom && editor.el.dom.getBoundingClientRect();
		}

		return rect ? rect.top : 0;
	},


	setActiveBundle: function(bundle) {
		var lesson = this.getLesson();

		if (lesson) {
			lesson.setActiveBundle(bundle);
		}

		this.currentBundle = bundle;
	},


	showOutlineNode: function(record) {
		var lesson = this.getLesson(true),
			editor = this.getEditor();

		if (editor) {
			editor.hide();
		}

		lesson.show();

		return lesson.renderLesson(record);
	},


	editOutlineNode: function(record) {
		var editor = this.getEditor(true),
			lesson = this.getLesson();

		if (lesson) {
			lesson.hide();
		}

		editor.show();

		return editor.editOutlineNode(record);
	}
});
