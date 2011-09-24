Ext.define('NextThought.view.widgets.chat.FriendEntry', {
//	extend:'Ext.panel.Panel',
    extend: 'Ext.Component',
    alias: 'widget.chat-friend-entry',

    renderTpl: new Ext.XTemplate(
        '<div class="x-chat-friend-entry {Presence} {cls}">',
            '<img src="{avatarURL}" width=16 height=16"/>',
            '<div>',
                '<span class="name">{name}</span> ',
            '</div>',
        '</div>',
        {
            compiled: true,
            disableFormats: true
        }),

    renderSelectors: {
        box: 'div.x-chat-friend-entry',
        name: '.x-chat-friend-entry span.name',
        icon: 'img'
    },

    initComponent: function(){
        this.addEvents('click');
        this.callParent(arguments);

        this.update(this.user);

        this.renderData['cls'] = this.cls || '';
    },

    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.box.on('click', function(){
            //if(!/offline/i.test(me.user.get('Presence')))
                me.fireEvent('click', me.user);
        });
    },

    update: function(user){
        this.user = user;
        var status = user.get('Presence') || 'offline';

        if (this.rendered){
            this.box.removeCls('offline online');
            this.box.addCls(status.toLowerCase());
            this.icon.set({src: user.get('avatarURL')});
            this.name.update( user.get('alias')||u.get('realname') );
        }
        else {
            this.renderData['Presence'] = status.toLowerCase();
            this.renderData['avatarURL'] = user.get('avatarURL');
            this.renderData['name'] = user.get('alias')||user.get('realname');
        }

        user.on('changed', this.update, this);
    }
});