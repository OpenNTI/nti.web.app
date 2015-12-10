Ext.define('NextThought.app.course.overview.components.editing.content.lessonoverview.Index', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-lessonoverview',

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},


	requires: [
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.Controls',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem'
	],


	ui: 'course',
	cls: 'course-overview course-overview-editing',

	initComponent: function() {
		this.callParent(arguments);

		//TODO: set drop handlers

		this.setCollection(this.contents);
	},


	onceLoaded: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		items = items || [];

		return Promise.resolve(items.map(function(item) {
			if (item && item.onceLoaded) {
				return item.onceLoaded();
			}

			return Promise.resolve();
		}));
	},


	getOrderingItems: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},


	getDropzoneTarget: function() {
		var body = this.getBodyContainer();

		return body && body.el && body.el.dom;
	},


	setCollection: function(collection) {
		this.disableOrderingContainer();
		this.removeAll();

		this.lessonOverview = collection;

		this.add([
			{xtype: 'box', isBodyContainer: true, layout: 'none', items: []},
			{
				xtype: 'overview-editing-controls',
				record: this.lessonOverview,
				root: this.lessonOverview,
				optionsConfig: {
					order: ['add']
				}
			}
		]);

		this.callParent(arguments);

		this.enableOrderingContainer();
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.overview.Group) {
			return NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem.create({
				record: record,
				lessonOverview: this.lessonOverview,
				outlineNode: this.record,
				enrollment: this.enrollment,
				locInfo: this.locInfo,
				assignments: this.assignments,
				course: this.bundle
			});
		}

		console.warn('Unknown type: ', record);
	}
});
