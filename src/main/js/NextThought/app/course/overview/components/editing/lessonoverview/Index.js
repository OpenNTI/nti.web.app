Ext.define('NextThought.app.course.overview.components.editing.lessonoverview.Index', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-lessonoverview',

	requires: [
		'NextThought.app.course.overview.components.editing.lessonoverview.Preview',
		'NextThought.app.course.overview.components.editing.overviewgroup.ListItem'
	],


	getBodyContainer: function() {
		return this.down('[isBodyContainer]');
	},

	setCollection: function(collection) {
		this.removeAll(true);

		this.add([
			{xtype: 'overview-editing-lessonoverview-preview', lessonOverview: collection, outlineNode: this.record},
			{xtype: 'container', layout: 'none', isBodyContainer: true, items: []}
		]);

		this.callParent(arguments);
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.overview.Group) {
			return NextThought.app.course.overview.components.editing.overviewgroup.ListItem.create({
				record: record,
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
