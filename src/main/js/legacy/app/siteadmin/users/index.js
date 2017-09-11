const Ext = require('extjs');

const { AdminUsers } = require('nti-web-site-admin');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

module.exports = exports = Ext.define('NextThought.app.siteadmin.users.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-users',
	cls: 'site-admin-users',
	layout: 'none',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.add({
			xtype: 'react',
			component: AdminUsers,
			workspace: Service.getWorkspace('SiteAdmin')
		});
	}
});
