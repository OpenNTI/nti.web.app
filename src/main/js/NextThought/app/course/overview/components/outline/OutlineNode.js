Ext.define('NextThought.app.course.overview.components.outline.OutlineNode', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline-group',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode'
	],

	cls: 'outline-group',

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var node = this.outlineNode,
			startDate = node.get('startDate'),
			classes = ['outline-row', node.get('type')],
			items = [];

		if (!node.get('isAvailable')) {
			classes.push('disabled');
		}

		items.push({cls: 'label', html: node.getTitle()});

		if (this.shouldShowDates && startDate) {
			items.push({
				cls: 'date',
				cn: [
					{html: Ext.Date.format(startDate, 'M')},
					{html: Ext.Date.format(startDate, 'j')}
				]
			});
		}


		this.add([
			{
				xtype: 'box',
				isNode: true,
				autoEl: {
					cls: classes.join(' '),
					'data-qtip': node.getTitle(),
					cn: items
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

		this.setCollection(node);
	},


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return NextThought.app.course.overview.components.outline.OutlineNode.create({
				outlineNode: record,
				shouldShowDates: this.shouldShowDates
			});
		}

		console.warn('Unknown type: ', record);
	}
});
