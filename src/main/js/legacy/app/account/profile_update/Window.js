const Ext = require('@nti/extjs');
const React = require('react');
const {ProfileUpdate} = require('@nti/web-profiles');
const {Prompt} = require('@nti/web-commons');

require('legacy/common/window/Window');
require('legacy/overrides/ReactHarness.js');


module.exports = exports = Ext.define('NextThought.app.account.contact.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.profile-update-window',
	cls: 'profile-update-window',
	ui: 'nt-window',
	minimizable: false,
	resizable: false,
	closeAction: 'destroy',
	layout: 'none',

	items: [],

	initComponent: function (args) {
		this.callParent(arguments);

		this.user.getInterfaceInstance()
			.then((entity) => {
				this.add({
					xtype: 'react',
					component: Prompt.Dialog,
					closeOnMaskClick: false,
					closeOnEscape: false,
					children: React.createElement(ProfileUpdate, {entity}),
					onBeforeDismiss: () => this.close()
				});
			});

	}
});
