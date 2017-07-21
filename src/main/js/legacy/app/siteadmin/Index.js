const Ext = require('extjs');

const AdminBody = require('nti-web-site-admin');

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

	items: [{
		xtype: 'react',
		component: AdminBody
	}],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();
	},

	onRouteActivate: function () {
		this.setTitle('Admin');
	}
});
