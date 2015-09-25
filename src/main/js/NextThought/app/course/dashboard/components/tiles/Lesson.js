export default Ext.define('NextThought.app.course.dashboard.components.tiles.Lesson', {
	extend: 'NextThought.app.course.dashboard.components.tiles.Item',
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
	},


	handleNavigation: function() {
		this.navigateToObject(this.record);
	}
});
