Ext.define('NextThought.app.course.overview.components.editing.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.outlinenode.Index',
		'NextThought.app.course.overview.components.editing.calendarnode.Index',
		'NextThought.app.course.overview.components.editing.contentnode.Index'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],


	editOutlineNode: function(record) {
		this.removeAll(true);

		if (record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			this.add({xtype: 'overview-editing-contentnode', outlineNode: record});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineCalendarNode) {
			this.add({xtype: 'overview-editing-calendarnode', outlineNode: record});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			this.add({xtype: 'overview-editing-outlinenode', outlineNode: record});
		}

		return Promise.resolve();
	}
});
