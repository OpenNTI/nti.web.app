Ext.define('NextThought.app.course.overview.components.outline.OutlineNode', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline-group',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode'
	],

	mixins: {
		'EllipsisText': 'NextThought.mixins.EllipsisText'
	},

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

		this.nodeCmp = this.down('[isNode]');

		this.setCollection(node);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.truncateLabels();
	},


	truncateLabels: function() {
		var me = this;

		if (!me.el) {
			me.onceRendered.then(me.truncateLabels.bind(me));
			return;
		}

		wait(100).then(function() {
			var label = me.nodeCmp.el.dom.querySelector('.label');

			if (label) {
				me.truncateText(label, null, true);
			}
		});
	},


	selectRecord: function(record) {
		var body = this.getBodyContainer();

		if (record.getId() === this.outlineNode.getId()) {
			this.nodeCmp.addCls('selected');
		} else {
			this.nodeCmp.removeCls('selected');
			this.nodeCmp.removeCls('out-of-view');
		}

		body.items.each(function(item) {
			item.selectRecord(record);
		});
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
