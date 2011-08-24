/*
To look like this:
    '<div style="float: right;  white-space: nowrap; margin-right: 5px">',
        '<span style="padding: 5px; padding-top: 6px;font-size: 12px; vertical-align: middle; cursor: pointer;">'+n+'</span> ',
        ' <span style="width: 24px; height: 23px; padding-top: 2px; display: inline-block; text-align: center; cursor: pointer; vertical-align: middle;margin-top: 2px; background: url(\'resources/images/notify.png\') no-repeat -25px 0px;">0</span> ',
        ' <img src="'+a+'" width=24 height=24 valign=middle> ',
        ' <img src="resources/images/gear.png" width=19 height=19 valign=middle>',
    '</div>'
 */

Ext.define('NextThought.view.widgets.SessionInfo', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.session-info',

    width: MIN_SIDE_WIDTH,
    height: 25,
    border: false,
    layout: 'hbox',
    defaults: {
        border: false,
        defaults: {}
    },

    initComponent: function() {
        this.callParent(arguments);

        var u = _AppConfig.server.userObject,
    		n = u.get('realname'),
    		a = u.get('avatarURL');

        this.add({html: n});
        this.add({
            html: '<span style="width: 24px; height: 23px; padding-top: 2px; display: inline-block; text-align: center; cursor: pointer; vertical-align: middle;margin-top: 2px; background: url(\'resources/images/notify.png\') no-repeat -25px 0px;">0</span>'
        });
        this.add({xtype: 'image', src: a,	height: 24, width: 24});
        this.add({xtype: 'image', src:'resources/images/gear.png', width: 19, height: 19 });
    }
});