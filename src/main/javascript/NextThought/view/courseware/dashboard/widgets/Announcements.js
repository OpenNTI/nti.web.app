Ext.define('NextThought.view.courseware.dashboard.widgets.Announcements', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Announcement'],

	statics: {

		__queryParams: {
			sortOn: 'CreatedTime',
			sortOrder: 'descending'
		},


		getTiles: function(course, startDate, endDate) {
			var section = course.getMySectionAnnouncements(),
				parent = course.getParentAnnouncements(),
				params = this.__queryParams;

			function getCmpConfig(topic, sectionName) {
				return {
					xtype: 'dashboard-announcement',
					record: topic,
					label: sectionName,
					weight: 2
				};
			}

			function loadContents(forum) {
				var contentsLink = forum.getLink('contents');

				return StoreUtils.loadItems(contentsLink, params)
							.fail(function() {
								return [];
							});
			}

			function loadForum(forum, sectionName) {
				return loadContents(forum)
					.then(function(topics) {
						return topics.map(function(topic) {
							return getCmpConfig(topic, sectionName);
						});
					});
			}

			function loadForums(forums, sectionName) {
				var loading = [];

				if (Ext.isEmpty(forums)) {
					return Promise.resolve([]);
				}

				(forums || []).forEach(function(forum) {
					loading.push(loadForum(forum, sectionName));
				});

				return Promise.all(loading)
						.then(function(tiles) {
							return tiles.reduce(function(a, b) {
								return a.concat(b);
							}, []);
						});
			}

			if (Ext.isEmpty(section) && Ext.isEmpty(parent)) {
				return Promise.resolve([]);
			}

			return Promise.all([
					loadForums(section, 'My Section'),
					loadForums(parent, 'Parent Section')
				]).then(function(results) {
					return results.reduce(function(a, b) {
						return a.concat(b);
					}, []);
				});
		}
	}
});
