const Ext = require('extjs');

const { AdminAdvanced } = require('nti-web-site-admin');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

module.exports = exports = Ext.define('NextThought.app.siteadmin.advanced.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-advanced',
	cls: 'site-admin-advanced',
	layout: 'none',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.add({
			xtype: 'react',
			component: AdminAdvanced,
			workspace: Service.getWorkspace('SiteAdmin')
		});
	}
});
