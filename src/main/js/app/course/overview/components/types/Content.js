export default Ext.define('NextThought.app.course.overview.components.types.Content', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-types-content',

	requires: [
		'NextThought.app.course.overview.components.parts.Header',
		'NextThought.app.course.overview.components.parts.Group',
		'NextThought.model.courses.overview.Lesson',
		'NextThought.model.courses.overview.Group',
		'NextThought.model.courses.LegacyCommunityBasedCourseInstance'
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


	setCommentCounts: function(commentCounts) {
		var body = this.getBodyContainer();

		this.commentCounts = commentCounts;

		if (!body) {
			return;
		}

		body.items.each(function(item) {
			if (item.setCommentCounts) {
				item.setCommentCounts(commentCounts);
			}
		});
	},


	onceLoaded: function() {
		var me = this;

		return new Promise(function(fulfill, reject) {
			if (me.collectionSet) {
				fulfill();
			} else {
				me.on({
					single: true,
					'collection-set': fulfill
				});
			}
		}).then(function() {
			var cmps = me.getComponents();

			return Promise.all(cmps.map(function(cmp) {
				if (cmp.onceLoaded) {
					return cmp.onceLoaded();
				}

				return Promise.resolve();
			}));
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
		var json = JSON.parse(response),
			items = json.Items || [];

		if (this.course instanceof NextThought.model.courses.LegacyCommunityBasedCourseInstance) {
			json.Items = items.map(this.__collapseGroup);
		}

		return ParseUtils.parseItems([json])[0];
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

		this.collectionSet = true;
		this.fireEvent('collection-set');

		if (this.commentsCounts) {
			this.setCommentCounts(this.commentsCounts);
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
