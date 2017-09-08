const Ext = require('extjs');

const NavigationActions = require('legacy/app/navigation/Actions');
const { AdminToolbar } = require('nti-web-site-admin');

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

		const handleNav = (title, route) => {
			this.NavigationActions = NavigationActions.create();
			this.NavigationActions.updateNavBar({ noLibraryLink: false });

			this.pushRootRoute(title, route);
		};

		this.add({
			xtype: 'react',
			component: AdminToolbar,
			handleNav: handleNav
		});
	}
});
