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

		body.items.each(function(item) {
			if (item.setProgress) {
				item.setProgress(progress);
			}
		});
	},


	__collapseGroup: function(group) {
		var items = group.Items;

		group.Items = items.reduce(function(acc, item, index, arr) {
			var last = acc.last(),
				next = index < (arr.length - 1) ? arr[index + 1] : null;

			if (item.MimeType === 'application/vnd.nextthought.ntivideo') {
				if (last && last.MimeType === 'application/vnd.nextthought.videoroll') {
					last.Items.push(item);
				} else if (next && next.MimeType === 'application/vnd.nextthought.ntivideo') {
					acc.push({
						MimeType: 'application/vnd.nextthought.videoroll',
						Class: 'VideoRoll',
						Items: [item]
					});
				} else {
					acc.push(item);
				}
			} else {
				acc.push(item);
			}

			return acc;
		}, []);

		return group;
	},


	parseCollection: function(response) {
		var json = JSON.parse(response);

		json.Items = json.Items.map(this.__collapseGroup);

		return ParseUtils.parseItems([json])[0];
	},


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
