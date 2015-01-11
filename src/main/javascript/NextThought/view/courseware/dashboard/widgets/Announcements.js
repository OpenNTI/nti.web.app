Ext.define('NextThought.view.courseware.dashboard.widgets.Announcements', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Announcements'],

	statics: {
		getTiles: function(course, courseNode, date) { return Promise.resolve([]); },

		getStaticTiles: function(course, courseNode, date) {
			return {
				announcements: Ext.widget('dashboard-announcements', {
					course: course,
					courseNode: courseNode,
					date: date
				})
			};
		}
	}
});
