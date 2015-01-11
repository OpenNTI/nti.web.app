Ext.define('NextThought.view.courseware.dashboard.widgets.Lessons', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Lessons'],

	statics: {
		getTiles: function(course, courseNode, startDate, endDate) {
			return Promise.resolve([Ext.widget({
				xtype: 'box',
				height: 1000,
				cls: 'testing',
				autoEl: {html: moment(startDate).format('dddd, MMMM Do YYYY') + '-' + moment(endDate).format('dddd, MMMM Do YYYY')}
			})]);
		},


		getDeadlines: function(course, courseNode, date) {
			return course.getNavigationStore().building
						.then(function(store) {
							var lessons = [];

							store.each(function(node) {
								var end = node.get('AvailableEnding');

								if (node.get('type') === 'lesson' && end > date) {
									lessons.push({
										label: 'lesson',
										title: node.get('label'),
										due: end,
										navigation: function() {}
									});
								}
							});

							return lessons;
						});
		}
	}
});
