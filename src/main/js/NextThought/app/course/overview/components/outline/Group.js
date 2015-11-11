Ext.define('NextThought.app.course.overview.components.outline.Group', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline-group',

	requires: [
		'NextThought.app.course.overview.components.outline.Lesson',
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode'
	],

	cls: 'outline-group',

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'box',
				autoEl: {
					cls: 'outline-row unit heading',
					cn: [
						{cls: 'label', html: this.outlineNode.getTitle()}
					]
				}
			},
			{
				xtype: 'container',
				bodyContainer: true,
				cls: 'items',
				layout: 'none',
				items: []
			}
		]);

		this.setCollection(this.outlineNode);
	},


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	getCmpForRecord: function(record) {
		var cmp,
			lesson = NextThought.app.course.overview.components.outline.Lesson,
			group = NextThought.app.course.overview.components.outline.Group;

		if (record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			cmp = lesson.create({outlineNode: record});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineCalendarNode) {
			cmp = lesson.create({outlineNode: record});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			cmp = group.create({outlineNode: record});
		} else {
			console.warn('Unknown type: ', record);
		}

		return cmp;
	}
});
