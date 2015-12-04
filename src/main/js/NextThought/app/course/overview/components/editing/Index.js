Ext.define('NextThought.app.course.overview.components.editing.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.outlinenode.Index',
		'NextThought.app.course.overview.components.editing.calendarnode.Index',
		'NextThought.app.course.overview.components.editing.contentnode.Index',
		'NextThought.app.course.overview.components.editing.Window'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],


	editOutlineNode: function(record) {
		this.removeAll(true);

		var record;

		if (record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			record = this.add({xtype: 'overview-editing-contentnode', outlineNode: record, bundle: this.bundle});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineCalendarNode) {
			record = this.add({xtype: 'overview-editing-calendarnode', outlineNode: record, bundle: this.bundle});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			record = this.add({xtype: 'overview-editing-outlinenode', outlineNode: record, bundle: this.bundle});
		}

		return record.onceLoaded();
	}
});
