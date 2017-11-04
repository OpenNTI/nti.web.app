const Ext = require('extjs');

const { AdminDashboard } = require('nti-web-site-admin');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

module.exports = exports = Ext.define('NextThought.app.siteadmin.dashboard.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-dashboard',
	cls: 'site-admin-dashboard',
	layout: 'none',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.add({
			xtype: 'react',
			component: AdminDashboard,
			workspace: Service.getWorkspace('SiteAdmin')
		});
	}
});
