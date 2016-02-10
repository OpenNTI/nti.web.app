Ext.define('NextThought.app.course.overview.components.types.Content', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-types-content',

	requires: [
		'NextThought.app.course.overview.components.parts.Header',
		'NextThought.app.course.overview.components.parts.Group',
		'NextThought.model.courses.overview.Lesson',
		'NextThought.model.courses.overview.Group'
	],


	setProgress: function(progress) {
		var body = this.getBodyContainer();

		this.progress = progress;

		if (!body) {
			return;
		}

		body.items.each(function(item) {
			if (item.setProgress) {
				item.setProgress(progress);
			}
		});
	},


	buildHeader: function(collection) {
		return {
			xtype: 'course-overview-header',
			record: this.record,
			title: collection.title || collection.getTitle && collection.getTitle(),
			onEdit: this.onEdit,
			course: this.course
		};
	},


	afterSetCollection: function() {
		if (this.progress) {
			this.setProgress(this.progress);
		}
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
