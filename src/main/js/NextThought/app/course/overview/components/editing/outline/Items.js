Ext.define('NextThought.app.course.overview.components.editing.outline.Items', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-outline-items',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.outline.outlinenode.ListItem',
		'NextThought.app.course.overview.components.editing.outline.calendarnode.ListItem',
		'NextThought.app.course.overview.components.editing.outline.contentnode.ListItem'
	],


	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},

	cls: 'outline-items',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.setCollection(this.record);
	},


	onceLoaded: function() {
		var items = this.getOrderingItems();

		return Promise.all(items.map(function(item) {
			if (item && item.onceLoaded) {
				return item.onceLoaded();
			}

			return Promise.resolve();
		}));
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
					cls: 'header',
					cn: [
						{cls: 'title', html: 'Title'}
					]
				}
			},
			{
				xtype: 'container',
				isBodyContainer: true,
				layout: 'none',
				items: []
			}
		]);

		this.callParent(arguments);

		this.enableOrderingContainer();
	},


	getCmpForRecord: function(record) {
		var cmp,
			base = NextThought.app.course.overview.components.editing.outline;


		if (record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			cmp = base.contentnode.ListItem.create({
				record: record
			});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineCalendarNode) {
			cmp = base.calendarnode.ListItem.create({
				record: record
			});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			cmp = base.outlinenode.ListItem.create({
				record: record
			});
		} else {
			console.warn('Unknown type: ', record);
		}

		return cmp;
	}
});
