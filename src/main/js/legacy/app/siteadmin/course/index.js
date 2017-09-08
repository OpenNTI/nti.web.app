const Ext = require('extjs');

const { AdminCourse } = require('nti-web-site-admin');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

module.exports = exports = Ext.define('NextThought.app.siteadmin.course.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-course',
	cls: 'site-admin-course',
	layout: 'none',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.add({
			xtype: 'react',
			component: AdminCourse,
			workspace: Service.getWorkspace('SiteAdmin')
		});
	}
});
