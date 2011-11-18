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
            cls: 'classroom-button',
            xtype: 'button',
            iconCls: 'classroom',
            tooltip: 'Classroom',
            scale: 'medium'
        },
		{
			cls: 'compose-msg-button',
			xtype: 'button',
			iconCls: 'compose',
			tooltip: 'Compose Message',
			scale: 'medium'
		},
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
            tooltip: 'enter/send'
        }
    ],

    initComponent:function() {
        this.callParent(arguments);
        this.addCls('reply-to-line');
        var me = this,
            b = me.down('button[iconCls=send]'),
            c = me.down('button[iconCls=compose]'),
            cls = me.down('button[iconCls=classroom]'),
            f = me.down('textfield');

        me.addEvents('send');

        f.on('specialkey', function(x, e){
            if (e.getKey() != e.ENTER) return;
            b.fireEvent('click', b);
        });

        f.on('focus', this.hideReplies, this);


        cls.on('click', function(){
            me.fireEvent('classroom', f, me.replyTo, me.channel, me.recipients);
        });

        b.on('click', function(){
            me.fireEvent('send', f, me.replyTo, me.channel, me.recipients);
        });

		c.on('click', function(){
            me.fireEvent('compose', f, me.replyTo, me.channel, me.recipients);
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
