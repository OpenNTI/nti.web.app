const Ext = require('@nti/extjs');

require('legacy/common/window/Window');
require('../Header');
require('./Main');


module.exports = exports = Ext.define('NextThought.app.account.coppa.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.coppa-window',
	cls: 'coppa-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: false,
	resizable: false,
	dialog: true,
	width: 480,
	layout: 'none',

	items: [
		{xtype: 'account-header-view'},
		{xtype: 'coppa-main-view'}
	],

	initComponent: function () {
		this.callParent(arguments);

		var view = this.down('coppa-main-view');

		view.setSchema(this.schema);
		view.handleSubmit = this.handleSubmit.bind(this);
	}
});
