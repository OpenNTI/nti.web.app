const Ext = require('extjs');

const Globals = require('legacy/util/Globals');

const CourseActions = require('../../course/Actions');

const CoursesActions = require('./Actions');
const CoursesStateStore = require('./StateStore');

require('legacy/mixins/Router');
require('./components/available/CoursePage');
require('./components/available/CourseWindow');
require('./components/Collection');

module.exports = exports = Ext.define('NextThought.app.library.courses.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-courses',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	isCoursePage: true,
	layout: 'none',
	cls: 'library-page',

	items: [{
		xtype: 'box',
		cls: 'title-container',
		autoEl: {cn: [
			{cls: 'home', html: 'Home'},
			{cls: 'title', html: 'Courses'},
			{cls: 'spacer'},
			{cls: 'add-more-link hidden', html: 'Add Courses'}
		]}
	}],

	initComponent: function () {
		this.callParent(arguments);

		var me = this;

		me.CourseStore = CoursesStateStore.getInstance();
		me.CourseViewActions = CourseActions.create();
		me.Actions = CoursesActions.create();

		me.addRoute('/', me.showCourses.bind(me));
		me.addRoute('/available', me.showAvailableCourses.bind(me));
		me.addDefaultRoute('/');

		me.mon(me.CourseStore, {
			'dropping-course': () => {
				me.addLoadingCmp();
			},
			'dropped-course': () => {
				me.loadCourses(true);
			},
			'added-course': () => {
				me.loadCourses(true);
			},
			'enrolled-courses-set': function () {
				if (me.isVisible) {
					me.loadCourses(true);
				}
			}
		});

		me.on({
			deactivate: me.onDeactivate.bind(me)
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));

		var addMoreLink = this.el.down('.add-more-link');

		if (this.CourseStore.hasAllCoursesLink() && addMoreLink) {
			addMoreLink.removeCls('hidden');
		}
	},


	getActiveItem: function () {
		if (this.availableWin && !this.availableWin.isDestroyed) {
			return this.availableWin;
		}
	},


	onDeactivate: function () {
		if (this.availableWin) {
			this.availableWin.destroy();
			delete this.availableWin;
		}
	},


	__getUpcomingCourses: function () {
		return this.CourseStore.getUpcomingEnrolledCourses();
	},


	__getCurrentCourses: function () {
		return this.CourseStore.getCurrentEnrolledCourses();
	},


	__getArchivedCourses: function () {
		return this.CourseStore.getArchivedEnrolledCourses();
	},


	addLoadingCmp () {
		if (this.coursePage) {
			this.el.mask('Loading...');
		} else {
			this.loadingCmp = this.loadingCmp || this.add(Globals.getContainerLoadingMask());
		}
	},


	removeLoadingCmp () {
		this.el.unmask();

		if (this.loadingCmp) {
			this.remove(this.loadingCmp, true);
			delete this.loadingCmp;
		}
	},


	loadCourses: function (force) {
		var me = this;

		if(me.coursePage) {
			me.coursePage.removeAll(true);
		}

		return Promise.all([
			me.Actions.loadEnrolledUpcomingCourses(),
			me.Actions.loadEnrolledCurrentCourses(),
			me.Actions.loadEnrolledArchivedCourses()
		]).then(function (results) {
			var upcomingCourses = me.__getUpcomingCourses(),
				currentCourses = me.__getCurrentCourses(),
				archivedCourses = me.__getArchivedCourses();

			me.removeLoadingCmp();

			if (!upcomingCourses.length && !currentCourses.length && !archivedCourses.length) {
				return me.showEmptyState();
			}

			if (me.emptyText) {
				me.remove(me.emptyText, true);
				delete me.emptyText;
			}

			if (me.coursePage) {
				//Only force an update if we want to, to prevent a blink
				if (force) {
					me.coursePage.setItems(upcomingCourses, currentCourses, archivedCourses);
				}
			} else {
				me.coursePage = me.add({
					xtype: 'library-view-course-page',
					upcoming: upcomingCourses,
					current: currentCourses,
					archived: archivedCourses,
					navigate: me.navigateToCourse.bind(me)
				});
			}
		});
	},


	showCourses: function (/*route, subRoute*/) {
		this.setTitle('Your Courses');

		if (this.availableWin) {
			this.availableWin.destroy();
			delete this.availableWin;
		}

		this.addLoadingCmp();

		return this.loadCourses(true);
	},


	showAvailableCourses: function (route, subRoute) {
		var me = this;

		return Promise.all([
			me.Actions.loadAllUpcomingCourses(),
			me.Actions.loadAllCurrentCourses()
		]).then(function () {
			if (!me.availableWin) {
				me.availableWin = Ext.widget('library-available-courses-window', {
					doClose: function () {
						if (route.precache.closeURL) {
							me.pushRootRoute('', route.precache.closeURL);
						} else {
							me.pushRoute('', '/');
						}
					}
				});
			}

			me.loadCourses();
			me.availableWin.show();
			me.setTitle('All Courses');

			me.addChildRouter(me.availableWin);
			if (me.availableWin && me.availableWin.handleRoute) {
				return me.availableWin.handleRoute(subRoute, route.precache);
			}
		});
	},


	showEmptyState: function () {
		if (this.coursePage) {
			this.remove(this.coursePage, true);
			delete this.coursePage;
		}

		this.emptyText = this.emptyText || this.add({
			xtype: 'box',
			autoEl: {cls: 'empty-text', html: 'You don\'t have any courses yet...<br><a class="add-more-link">+ Add Courses</a>'}
		});
	},


	navigateToCourse: function (enrollment, el) {
		var me = this,
			instance = enrollment.get('CourseInstance');

		me.CourseViewActions.transitionToCourse(instance, el)
			.then(function (route) {
				me.pushRootRoute(null, route, {course: instance});
			});
	},


	onClick: function (e) {
		if (e.getTarget('.add-more-link')) {
			this.pushRoute('Available', '/available');
		} else if (e.getTarget('.home')) {
			this.pushRootRoute('', '/');
		}
	}
});
