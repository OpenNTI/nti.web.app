Ext.define('NextThought.app.course.overview.components.editing.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-window',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading',
		'NextThought.app.course.overview.components.editing.Outline',
		'NextThought.app.course.overview.components.editing.Lesson'
	],


	initComponent: function() {
		this.callParent(arguments);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.doClose.bind(this)
		});

		if (this.precache.outline) {
			this.showOutline(this.precache.outline);
		} else if (this.precache.lesson) {
			this.showLesson(this.precache.lesson);
		}
	},


	showOutline: function(outline) {
		this.add({
			xtype: 'overview-editing-outline',
			outline: outline
		});
	},


	showLesson: function(lesson) {
		this.add({
			xtype: 'overview-editing-lesson',
			lesson: lesson
		});
	}

}, function() {
	NextThought.app.windows.StateStore.register('outline-editing', this);
	NextThought.app.windows.StateStore.register('lesson-editing', this);
});
