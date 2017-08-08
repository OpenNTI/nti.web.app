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

	loadCourses: function (force) {
		var me = this;

		return Promise.all([
			me.Actions.loadAdminUpcomingCourses(),
			me.Actions.loadAdminCurrentCourses()
		]).then(function () {
			var upcomingCourses = me.__getUpcomingCourses(),
				currentCourses = me.__getCurrentCourses();

			me.removeLoadingCmp();

			if (me.emptyText) {
				me.remove(me.emptyText, true);
				delete me.emptyText;
			}

			if (me.coursePage) {
				//Only force an update if we want to, to prevent a blink
				if (force) {
					me.coursePage.setItems(upcomingCourses, currentCourses, []);
				}
			} else {
				me.coursePage = me.add({
					xtype: 'library-view-course-page',
					upcoming: upcomingCourses,
					current: currentCourses,
					archived: [],	// defer loading of archived for performance reasons
					archivedLoader: () => {
						const archived = me.__getArchivedCourses();
						if(!archived) {
							// need to lazy load
							return me.Actions.loadAdminArchivedCourses().then(() => {
								return me.__getArchivedCourses();
							});
						}

						return Promise.resolve(archived);
					},
					navigate: me.navigateToCourse.bind(me)
				});
			}
		});
	},


	showAvailableCourses: function (route, subRoute) {}
});
