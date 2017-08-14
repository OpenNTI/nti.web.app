const Ext = require('extjs');

const AdminBody = require('nti-web-site-admin');
const NavigationActions = require('legacy/app/navigation/Actions');

require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

module.exports = exports = Ext.define('NextThought.app.siteadmin.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-index',
	cls: 'site-admin-index',
	layout: 'none',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.NavigationActions = NavigationActions.create();
		this.NavigationActions.updateNavBar({ darkStyle: true });

		this.add({
			xtype: 'react',
			component: AdminBody,
			workspace: Service.getWorkspace('SiteAdmin')
		});
	},

	onRouteActivate: function () {
		this.setTitle('Admin');
	}
});
