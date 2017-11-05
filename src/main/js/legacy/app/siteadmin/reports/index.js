const Ext = require('extjs');

const { AdminReports } = require('nti-web-site-admin');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

module.exports = exports = Ext.define('NextThought.app.siteadmin.reports.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-reports',
	cls: 'site-admin-reports',
	layout: 'none',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.add({
			xtype: 'react',
			component: AdminReports,
			workspace: Service.getWorkspace('SiteAdmin')
		});
	}
});
