var Ext = require('extjs');
var WindowWindow = require('../../../../common/window/Window');
var UpgradedConfirm = require('./Confirm');
var AccountHeader = require('../../Header');


module.exports = exports = Ext.define('NextThought.app.account.coppa.upgraded.Window', {
    extend: 'NextThought.common.window.Window',
    alias: 'widget.coppa-confirm-window',
    cls: 'coppa-window',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    modal: true,
    closable: false,
    resizable: false,
    dialog: true,
    width: 670,
    layout: 'none',

    items: [
		{xtype: 'account-header-view', title: 'It\'s a new school year!', detail: 'Please answer the following questions, so we can update our records.'},
		{xtype: 'coppa-birthday-form'}
	]
});
