Ext.define('NextThought.app.course.overview.components.editing.lessonoverview.Index', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-lessonoverview',

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},

	requires: [
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.lessonoverview.Preview',
		'NextThought.app.course.overview.components.editing.overviewgroup.ListItem'
	],


	initComponent: function() {
		this.callParent(arguments);

		this.setDataTransferHandler(NextThought.model.courses.overview.Group.mimeType, this.handleGroupDrop.bind(this));
	},


	getBodyContainer: function() {
		return this.down('[isBodyContainer]');
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
		this.removeAll(true);

		this.lessonOverview = collection;

		this.add([
			{xtype: 'overview-editing-lessonoverview-preview', lessonOverview: collection, outlineNode: this.record},
			{xtype: 'container', layout: 'none', isBodyContainer: true, items: []}
		]);

		this.callParent(arguments);
		this.enableOrderingContainer();
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.overview.Group) {
			return NextThought.app.course.overview.components.editing.overviewgroup.ListItem.create({
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
	},


	handleGroupDrop: function() {}
});
