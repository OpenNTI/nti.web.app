Ext.define('NextThought.view.widgets.chat.Log', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-log-view',
    requires: [
        'NextThought.view.widgets.chat.LogEntry',
        'NextThought.view.widgets.chat.LogEntryModerated'
    ],

    autoScroll: true,
    layout: 'anchor',
    border: false,
    defaults: {border: false, defaults: {border: false}},

    initComponent:function() {

        this.entryType = this.entryType || 'chat-log-entry';
        this.moderated = !!this.moderated;
        if(this.moderated){
           this.entryType+='-moderated';
           //todo - add docked item to bottom

           this.tools = [
                        {
                            type: 'gear',
                            tooltip: 'select all',
                            action: 'selectall'
                        },
                        {
                            type: 'help',
                            tooltip: 'select none',
                            action: 'selectnone'
                        },
                        {
                            type: 'next',
                            tooltip: 'approve selected',
                            action: 'approve'
                        },
                        {
                            type: 'prev',   
                            tooltip: 'reject selected',
                            action: 'reject'
                        }
                    ];
            this.dockedItems = {
               xtype: 'toolbar',
               dock: 'bottom',
               items: [
                   {
                       text: 'Select All',
                       action: 'selectall'
                   },
                   {
                       text: 'Select None',
                       action: 'selectnone'},
                   {
                       text: 'Approve',
                       action: 'approve'},
                   {
                       text: 'Reject',
                       action: 'reject'}
               ]
            };
        }

        this.callParent(arguments);
    },

    selectall: function() {
        Ext.each(this.query(this.entryType), function(f){
            f.setValue(true);
        });
    },

    selectnone: function() {
        Ext.each(this.query(this.entryType), function(f){
            f.setValue(false);
        });
    },

    approve: function(){
        var a = [];

        Ext.each(this.query(this.entryType), function(f){
            if(f.getValue()){
                a.push(f.message.getId());
            }
        },this);

        this.fireEvent('approve', a);
    },

    reject: function() {
        Ext.each(this.query(this.entryType), function(f){
            if(f.getValue()) this.remove(f);
        },this);
    },

    removeMessage: function(msg) {
        var m = this.down(this.entryType+'[messageId='+msg.getId()+']');
        if (m) this.remove(m);
    },

    addMessage: function(msg) {
        var id = msg.getId(),
            rid = msg.get('inReplyTo'),
            m = this.down(this.entryType+'[messageId=' + id + ']');
    
        if (m)

        if (rid)
            this.down(this.entryType +  '[messageId='+msg.get('inReplyTo') +']');

        var o = this.add({
                xtype: this.entryType,
                message: msg,
                messageId: msg.getId()
            });

        this.scroll(o);
    },

    scroll: function(entry) {
        entry.el.scrollIntoView(this.el.first('.x-panel-body'));
    },

    addNews: function(msg) {
        var o = this.add({
            html: msg
        });

        o.el.scrollIntoView(this.el.first());
    }
});