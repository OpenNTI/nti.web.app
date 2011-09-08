Ext.define('NextThought.view.widgets.StreamEntry', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.streamEntry',

	cls: 'x-stream-entry',
    defaults: {border: false},
    layout: {type: 'hbox'},
    border: false,
    change: null,
    items: [{
            xtype: 'panel',
            border: false
            //title: 'Avatar Panel'
        },
        {
            xtype: 'panel',
            border: false
            //title: 'content'
        }],

    initComponent: function(){
        this.callParent(arguments);

        var p = this.items.get(1),
            a = this.items.get(0),
            c = this.change.get('Creator'),
            u = UserDataLoader.resolveUser(c),
            i = this.change.get('Item');

        //Add avatar:
        a.add({html: this.getAvatarImageHTML(u)})

        //Add content
        p.add({
            html: [
                u.get('realname')
                ,' '
                ,this.change.get('ChangeType')
                ,' a '
                ,i.raw.Class
                ,'...'
                ,this.getItemContentHTML(i)
            ].join('')
        });
    },

    getAvatarImageHTML: function(u) {
        return '<img width=48 height=48 src="' + u.get('avatarURL') + '" valign=middle>';
    },

    getItemContentHTML: function(i) {
        var c = i.raw.Class;

        if (c == "Note") return this.getNoteContentHTML(i);
        else if (c == "User") return this.getUserContentHTML(i);
    },

    getNoteContentHTML: function(n) {
        var t = n.get('text');

        return t;
    },

    getUserContentHTML: function(u) {
        return u.get('realname');
    }

});