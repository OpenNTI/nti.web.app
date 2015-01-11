Ext.define('NextThought.view.courseware.dashboard.widgets.Announcements', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Announcement'],

	statics: {
		getTiles: function(course, courseNode, startDate, endDate) { return Promise.resolve([]); },

		getStaticTiles: function(course, courseNode, date) {
			return Ext.widget('dashboard-announcements-list', {
					loadAnnouncements: course.getAnnouncements()
				});
		}
	}
});
