const Ext = require('extjs');

require('legacy/mixins/Router');
require('./EditingControls');
require('./Lesson');
require('./editing/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-body',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [
		{xtype: 'course-overview-editing-controls'}
	],

	initComponent: function () {
		this.callParent(arguments);

		var me = this;

		me.editingControlsCmp = me.down('course-overview-editing-controls');

		me.editingControlsCmp.openEditing = function () {
			if (me.openEditing) {
				me.openEditing();
			}
		};

		me.editingControlsCmp.closeEditing = function () {
			if (me.closeEditing) {
				me.closeEditing();
			}
		};

		me.editingControlsCmp.openAuditLog = function () {
			if (me.openAuditLog) {
				me.openAuditLog();
			}
		};

		me.editingControlsCmp.gotoResources = function () {
			if (me.gotoResources) {
				me.gotoResources();
			}
		};

		me.editingControlsCmp.hide();
	},


	onRouteActivate () {
		this.isActive = true;

		if (this.hasEditingControls) {
			this.editingControlsCmp.show();
		}
	},


	onRouteDeactivate () {
		delete this.isActive;

		const lesson = this.getLesson();
		const editor = this.getEditor();

		this.editingControlsCmp.hide();

		if (lesson && lesson.onRouteDeactivate) {
			lesson.onRouteDeactivate();
		}

		if (editor && editor.onRouteDeactivate) {
			editor.onRouteDeactivate();
		}
	},

	showEditControls: function () {
		if (!this.editingControlsCmp.isHidden() || !this.isActive) { return; }

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

	hideEditControls: function () {
		this.removeCls('has-editing-controls');
		delete this.hasEditingControls;
		this.editingControlsCmp.hide();
	},

	showEditing: function () {
		this.isEditing = true;

		if (this.hasEditingControls) {
			this.editingControlsCmp.showEditing();
		}
	},

	showNotEditing: function () {
		delete this.isEditing;

		if (this.hasEditingControls) {
			this.editingControlsCmp.showNotEditing();
		}
	},

	clear: function () {
		var lesson = this.down('course-overview-lesson');

		if (lesson) {
			lesson.destroy();
		}
	},

	getLesson: function (addIfNotThere) {
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

	getEditor: function (addIfNotThere) {
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

	getEmptyState: function (addIfNotThere) {
		var emptyState = this.down('[isEmptyState]'),
			me = this;

		if (!emptyState && addIfNotThere) {

			var cmps = [
				{ html: 'There is no lesson to display.'}
			];

			if (this.hasEditingControls) {
				cmps.push({ tag: 'a', cls: 'edit', html: 'Get started editing here.'});
			}

			emptyState = this.add({
				isEmptyState: true,
				cls: 'empty-state',
				xtype: 'container',
				layout: 'none',
				items: [{
					xtype: 'box',
					autoEl: {
						cls: 'empty-text',
						cn: cmps
					},
					listeners: {
						click: {
							element: 'el',
							fn: function (e) {
								if (e.getTarget('.edit') && me.openEditing) {
									me.openEditing();
								}
							}
						}
					}
				}]
			});
		}

		return emptyState;
	},

	getLessonTop: function () {
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

	setActiveBundle: function (bundle) {
		var lesson = this.getLesson(),
			editor = this.getEditor();

		if (lesson) {
			lesson.setActiveBundle(bundle);
		}

		if (editor) {
			editor.setActiveBundle(bundle);
		}

		this.currentBundle = bundle;
	},

	setOutline: function (outline, outlineInterface) {
		this.currentOutline = outline;
		this.outlineInterface = outlineInterface;
	},

	showOutlineNode: function (record, doNotCache) {
		var lesson = this.getLesson(true),
			editor = this.getEditor(),
			emptyState = this.getEmptyState();

		if (editor) {
			editor.hide();
		}

		if (emptyState) {
			emptyState.hide();
		}

		lesson.show();

		return lesson.renderLesson(record, doNotCache);
	},

	editOutlineNode: function (record) {
		var editor = this.getEditor(true),
			lesson = this.getLesson(),
			emptyState = this.getEmptyState();

		if (lesson) {
			lesson.hide();
		}

		if (emptyState) {
			emptyState.hide();
		}

		editor.show();

		return editor.editOutlineNode(record, this.currentOutline, this.outlineInterface);
	},

	showEmptyState: function () {
		var emptyState = this.getEmptyState(true),
			editor = this.getEditor(),
			lesson = this.getLesson();

		if (editor) {
			editor.hide();
		}

		if (lesson) {
			lesson.hide();
		}

		emptyState.show();

		return Promise.resolve();
	}
});
