var Ext = require('extjs');
var StoreUtils = require('../../../../../util/Store');
var WidgetsBase = require('./Base');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.widgets.Announcements', {
	extend: 'NextThought.app.course.dashboard.components.widgets.Base',

	//requires: ['NextThought.app.course.dashboard.components.tiles.AnnouncementsList'],

	statics: {

		__BASE_WEIGHT: 3,

		__queryParams: {
			sortOn: 'CreatedTime',
			sortOrder: 'descending'
		},


		getWeight: function (record) {
			var time = NextThought.app.course.dashboard.components.widgets.Base.getTimeWeight(record.get('Last Modified'));

			return this.__BASE_WEIGHT + time;
		},


		getTiles: function (course, startDate, endDate) {
			return Promise.resolve([]);

			//var section = course.getMySectionAnnouncements(),
			//	parent = course.getParentAnnouncements(),
			//	params = this.__queryParams,
			//	getWeight = this.getWeight.bind(this);

			//function getCmpConfig(topic, sectionName) {
			//	return {
			//		xtype: 'dashboard-announcement',
			//		record: topic,
			//		label: sectionName,
			//		weight: getWeight(topic)
			//	};
			//}

			//function loadContents(forum) {
			//	var contentsLink = forum.getLink('contents');

			//	return StoreUtils.loadItems(contentsLink, params)
			//				.fail(function() {
			//					return [];
			//				});
			//}

			//function loadForum(forum, sectionName) {
			//	return loadContents(forum)
			//		.then(function(topics) {
			//			return topics.map(function(topic) {
			//				return getCmpConfig(topic, sectionName);
			//			});
			//		});
			//}

			//function loadForums(forums, sectionName) {
			//	var loading = [];

			//	if (Ext.isEmpty(forums)) {
			//		return Promise.resolve([]);
			//	}

			//	(forums || []).forEach(function(forum) {
			//		loading.push(loadForum(forum, sectionName));
			//	});

			//	return Promise.all(loading)
			//			.then(function(tiles) {
			//				return tiles.reduce(function(a, b) {
			//					return a.concat(b);
			//				}, []);
			//			});
			//}

			//if (Ext.isEmpty(section) && Ext.isEmpty(parent)) {
			//	return Promise.resolve([]);
			//}

			//return Promise.all([
			//		loadForums(section, 'My Section'),
			//		loadForums(parent, 'Parent Section')
			//	]).then(function(results) {
			//		return results.reduce(function(a, b) {
			//			return a.concat(b);
			//		}, []);
			//	});
		}
	}
});
