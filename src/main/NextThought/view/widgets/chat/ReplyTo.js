Ext.define('NextThought.view.widgets.chat.ReplyTo', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-reply-to',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    border: false,
    height: 32,

    items:[
        {
            cls: 'chat-entry',
            xtype: 'textfield',
            chatentry: true,
            flex: 1
        },
        {
            cls: 'reply-to-button',
            xtype: 'button',
            iconCls: 'send',
            tooltop: 'enter/send'
        }
    ],

    initComponent:function() {
        this.callParent(arguments);
        this.addCls('reply-to-line');
        var me = this,
            b = me.down('button'),
            f = me.down('textfield');

        me.addEvents('send');

        f.on('specialkey', function(x, e){
            if (e.getKey() != e.ENTER) return;
            b.fireEvent('click', b);
        });

        f.on('focus', this.hideReplies, this);

        b.on('click', function(){
            me.fireEvent('send', f, me.replyTo, me.channel, me.recipients);
        });

    },

    setChannel: function(channel, recipients){
        console.debug('setChannel: ',arguments);
        this.channel = channel? channel : undefined;
        this.recipients = recipients? recipients : undefined;
    },

    hideReplies : function(){
        var me = this;
        Ext.each(this.up('chat-view').query('chat-reply-to[replyTo]'),function(r){
            if(r!==me)
                r.close();
                //r.destroy()
        });
    },

    afterRender: function() {
        this.callParent(arguments);
        this.down('textfield').focus();
    }
});
