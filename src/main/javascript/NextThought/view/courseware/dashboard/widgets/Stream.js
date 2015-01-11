Ext.define('NextThought.view.courseware.dashboard.widgets.Stream', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: [
		'NextThought.view.courseware.dashboard.tiles.Note',
		'NextThought.view.courseware.dashboard.tiles.Topic',
		'NextThought.view.courseware.dashboard.tiles.TopicComment'
	],

	statics: {

		__queryParams: {
			exclude: 'application/vnd.nextthought.redaction',
			sortOn: 'lastModified',
			sortOrder: 'descending'
		},


		__CLASS_TO_XTYPE: {
			'Note': 'dashboard-note',
			'CommunityHeadlineTopic': 'dashboard-topic',
			'GeneralForumComment': 'dashboard-topic-comment'
		},

		__BASE_WEIGHT: 2,

		getWeight: function(record) {
			var timeWeight = NextThought.view.courseware.dashboard.widgets.Base.getTimeWeight(record.get('Last Modified'));

			return this.__BASE_WEIGHT + timeWeight;
		},


		getTiles: function(course, startDate, endDate) {
			var link = course.getStreamLink(),
				params = this.__queryParams,
				getWeight = this.getWeight.bind(this),
				classMap = this.__CLASS_TO_XTYPE;

			function getCmpConfig(record) {
				return {
					xtype: classMap[record.get('Class')],
					record: record,
					weight: getWeight(record)
				};
			}

			if (!link) { return Promise.resolve([]); }

			return StoreUtils.loadItems(link, params)
				.then(function(items) {
					return (items || []).map(function(change) {
						var item = change.getItem();

						return getCmpConfig(item);
					});
				})
				.fail(function(reason) {
					console.error('failed to load dashboard stream:', reason);
					return [];
				});
		}
	}
});
