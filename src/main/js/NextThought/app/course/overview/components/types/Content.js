Ext.define('NextThought.app.course.overview.components.types.Content', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-types-content',

	requires: [
		'NextThought.app.course.overview.components.parts.Header',
		'NextThought.app.course.overview.components.parts.Group',
		'NextThought.model.courses.overview.Lesson',
		'NextThought.model.courses.overview.Group'
	],


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	setCollection: function(collection) {
		this.removeAll(true);

		this.add([
			{xtype: 'course-overview-header', record: this.record, title: collection.title, onEdit: this.onEdit},
			{xtype: 'container', layout: 'none', bodyContainer: true, items: []}
		]);

		this.callParent(arguments);
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.overview.Group) {
			return NextThought.app.course.overview.components.parts.Group.create({
				record: record,
				outlineNode: this.record,
				enrollment: this.enrollment,
				locInfo: this.locInfo,
				assignments: this.assignments,
				course: this.course,
				navigate: this.navigate
			});
		}

		console.warn('Unknown type: ', record);
	}
});
