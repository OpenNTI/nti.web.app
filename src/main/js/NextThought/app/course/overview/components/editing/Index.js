Ext.define('NextThought.app.course.overview.components.editing.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.outlinenode.Preview',
		'NextThought.app.course.overview.components.editing.calendarnode.Preview',
		'NextThought.app.course.overview.components.editing.contentnode.Preview'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],


	editOutlineNode: function(record) {
		this.removeAll(true);

		if (record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			this.add({xtype: 'overview-editing-contentnode-preview', outlineNode: record});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineCalendarNode) {
			this.add({xtype: 'overview-editing-calendarnode-preview', outlineNode: record});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			this.add({xtype: 'overview-editing-outlinenode-preview', outlineNode: record});
		}

		return Promise.resolve();
	}
});
