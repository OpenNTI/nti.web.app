const Ext = require('@nti/extjs');
const format = require('date-fns/format');

require('./Item');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.tiles.Lesson', {
	extend: 'NextThought.app.course.dashboard.components.tiles.Item',
	alias: 'widget.dashboard-lesson',

	cls: 'dashboard-item lesson-tile',


	getPath: function () {
		return 'Lessons';
	},


	getTitle: function () {
		return this.record.get('title');
	},


	getBullets: function () { return []; },


	getFooter: function () {
		var start = this.record.get('startDate');

		return format(start, 'eeee, MMMM d');
	},


	handleNavigation: function () {
		this.navigateToObject(this.record);
	}
});
