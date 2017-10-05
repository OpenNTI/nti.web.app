const Ext = require('extjs');

const NavigationActions = require('legacy/app/navigation/Actions');
const { AdminToolbar } = require('nti-web-site-admin');

const CoursesStateStore = require('../courses/StateStore');

module.exports = exports = Ext.define('NextThought.app.library.admin.Toolbar', {
	extend: 'Ext.container.Container',
	alias: 'widget.administrative-toolbar',

	statics: {
		shouldShow: function () {
			return Service.getWorkspace('SiteAdmin');
		}
	},

	initComponent () {
		this.callParent(arguments);

		this.CourseStore = CoursesStateStore.getInstance();

		const handleNav = (title, route) => {
			this.NavigationActions = NavigationActions.create();
			this.NavigationActions.updateNavBar({ noLibraryLink: false });

			this.pushRootRoute(title, route);
		};

		const onCourseCreated = () => {
			this.CourseStore.fireEvent('added-course');
		};

		this.add({
			xtype: 'react',
			component: AdminToolbar,
			handleNav: handleNav,
			onCourseCreated: onCourseCreated
		});
	}
});
