Ext.define('NextThought.view.widgets.MiniStreamEntry', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.miniStreamEntry',

	cls: 'x-stream-entry',
    defaults: {border: false},
    border: false,
    change: null,

    initComponent: function(){
        this.callParent(arguments);

        var p = this,
            c = this.change.get('Creator'),
            u = UserDataLoader.resolveUser(c);

        p.add({
            html: [
                '<img width=16 height=16 src="',u.get('avatarURL'),'" valign=middle>'
                , u.get('realname')
                ,' '
                ,this.change.get('ChangeType')
                ,' a '
                ,this.change.get('Item').raw.Class
                ,'...'
            ].join('')
        });
    }
});