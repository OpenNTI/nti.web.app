Ext.define('NextThought.view.widgets.chat.ReplyTo', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-reply-to',

    layout: 'hbox',
    border: false,
    //height: 30,

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
            text: 'enter'
        }
    ],

    initComponent:function() {
        this.callParent(arguments);

        var me = this,
            b = me.down('button'),
            f = me.down('textfield');

        me.addEvents('send');
        me.enableBubble('send');

        f.on('specialkey', function(x, e){
            if (e.getKey() != e.ENTER) return;
            b.fireEvent('click', b);
        });

        b.on('click', function(){
            me.fireEvent('send', f, me.replyTo);
        });
    },

    afterRender: function() {
        this.callParent(arguments);
        this.down('textfield').focus();
    }
});