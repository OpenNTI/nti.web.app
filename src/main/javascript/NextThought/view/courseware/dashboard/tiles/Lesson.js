Ext.define('NextThought.view.courseware.dashboard.tiles.Lesson', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Item',
	alias: 'widget.dashboard-lesson',

	cls: 'dashboard-item lesson-tile',


	getPath: function() {
		return 'Lessons';
	},


	getTitle: function() {
		return this.record.get('title');
	},


	getBullets: function() { return []; },


	getFooter: function() {
		var start = this.record.get('startDate');

		return moment(start).format('dddd, MMMM D');
	}
});
