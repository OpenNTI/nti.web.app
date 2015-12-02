Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Items', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-outlinenode-items',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.contentnode.ListItem',
		'NextThought.app.course.overview.components.editing.calendarnode.ListItem',
		'NextThought.app.course.overview.components.editing.outlinenode.ListItem'
	],

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.setCollection(this.outlineNode);
	},


	getBodyContainer: function() {
		return this.down('[isBodyContainer]');
	},


	getDropzoneTarget: function() {
		var body = this.getBodyContainer();

		return body && body.el && body.el.dom;
	},


	getOrderingItems: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},


	setCollection: function(collection) {
		this.disableOrderingContainer();
		this.removeAll(true);

		this.add([
			{
				xtype: 'box',
				autoEl: {
					cls: 'item-controls',
					cn: [
						{tag: 'span', cls: 'publish', html: 'Publish All'},
						{tag: 'span', cls: 'unpublish', html: 'Unpublish All'}
					]
				}
			},
			{
				xtype: 'container',
				isBodyContainer: true,
				layout: 'none',
				items: []
			},
			{
				xtype: 'box',
				autoEl: {
					cls: 'footer-controls',
					cn: [
						{tag: 'span', cls: 'new-item new-lesson', html: 'New Lesson'}
					]
				},
				listeners: {
					click: {
						element: 'el',
						fn: function(e) {

						}
					}
				}
			}
		]);

		this.callParent(arguments);

		this.enableOrderingContainer();
	},


	getCmpForRecord: function(record) {
		var cmp;

		if (record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			cmp = NextThought.app.course.overview.components.editing.contentnode.ListItem.create({
				outlineNode: record
			});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineCalendarNode) {
			cmp = NextThought.app.course.overview.components.editing.calendarnode.ListItem.create({
				outlineNode: record
			});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			cmp = NextThought.app.course.overview.components.editing.outlinenode.ListItem.create({
				outlineNode: record
			});
		} else {
			console.warn('Unknown type: ', record);
		}

		return cmp;
	}
});
