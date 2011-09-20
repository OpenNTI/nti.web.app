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
          '</div>'
          ),

    renderSelectors: {
        box: 'div.x-chat-friend-entry',
        name: '.x-chat-friend-entry span.name',
        icon: 'img'
    },

    initComponent: function(){
        this.addEvents('click');
        this.callParent(arguments);

        var u = this.user,
            status = u.get('Presence') || 'offline';

        this.renderData['cls'] = this.cls || '';
        this.renderData['Presence'] = status.toLowerCase();
        this.renderData['avatarURL'] = u.get('avatarURL');
        this.renderData['name'] = u.get('alias')||u.get('realname');
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
        var status = user.get('Presence');

        this.box.removeCls('offline online');
        this.box.addCls(status.toLowerCase());

        this.icon.set({src: user.get('avatarURL')});
        this.name.update( user.get('alias')||u.get('realname') );
    }
});