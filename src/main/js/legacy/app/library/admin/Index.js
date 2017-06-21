const Ext = require('extjs');

require('../courses/Index');
require('legacy/mixins/Router');


module.exports = exports = Ext.define('NextThought.app.library.admin.Index', {
	extend: 'NextThought.app.library.courses.Index',
	alias: 'widget.library-admin',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	isCoursePage: false,

	layout: 'none',

	items: [{
		xtype: 'box',
		cls: 'title-container',
		autoEl: {cn: [
			{cls: 'home', html: 'Home'},
			{cls: 'title', html: 'Administered Courses'}
		]}
	}],

	__getUpcomingCourses: function () {
		return this.CourseStore.getUpcomingAdminCourses();
	},


	__getCurrentCourses: function () {
		return this.CourseStore.getCurrentAdminCourses();
	},


	__getArchivedCourses: function () {
		return this.CourseStore.getArchivedAdminCourses();
	},


	showAvailableCourses: function (route, subRoute) {}
});
