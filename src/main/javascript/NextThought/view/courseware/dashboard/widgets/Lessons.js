Ext.define('NextThought.view.courseware.dashboard.widgets.Lessons', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Lessons'],

	statics: {
		getTiles: function(course, courseNode, startDate, endDate) {
			return new Promise(function(fulfill, reject) {
				var tiles = [], i;

				for (i = 0; i < 20; i ++) {
					tiles.push({
						xtype: 'box',
						cls: 'tile',
						height: (Math.floor(Math.random() * 5) + 1) * 100,
						autoEl: {html: 'hello-' + moment(startDate).format('MMM D') + '-' + moment(endDate).format('MMM D')}
					});
				}

				fulfill(tiles);
			})
		}
	}
});
