Ext.define('NextThought.view.courseware.dashboard.widgets.Assignments', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: [],

	statics: {
		getTiles: function(course, startDate, endDate) { return Promise.resolve([]); }
	}
});
