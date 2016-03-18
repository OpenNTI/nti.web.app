var Ext = require('extjs');
var WindowWindow = require('../../../../../../common/window/Window');
var InfoView = require('./View');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.emailverify.info.Window', {
    extend: 'NextThought.common.window.Window',
    alias: 'widget.email-verify-info-window',
    cls: 'email-verification-window info',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    constrainTo: Ext.getBody(),
    floating: true,
    closable: true,
    resizable: false,
    width: 450,
    dialog: true,
    closeAction: 'destroy',
    layout: 'none',

    items: [
		{xtype: 'email-verify-info-view'}
	]
});
