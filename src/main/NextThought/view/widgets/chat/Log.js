Ext.define('NextThought.view.widgets.chat.Log', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-log-view',
    requires: [
        'NextThought.view.widgets.chat.LogEntry',
        'NextThought.view.widgets.chat.LogEntryModerated'
    ],

    cls: 'chat-log-view',
    autoScroll: true,
    layout: 'anchor',
    border: false,
    defaults: {border: false},

    getMessageQuery: function(id){
        return Ext.String.format('{0}[messageId={1}]', this.entryType, id);
    },

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
                a.push(f.message.get('ID'));
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
        var c,m = this.down(this.getMessageQuery(msg.getId()));
        if (m) {
            c = m.ownerCt;
            c.remove(m);
//            console.debug('c=', c);
            if(c.xtype != 'chat-log-view' && c.items.getCount() == 0) c.destroy();
        }

    },

    addMessage: function(msg) {
        var id = msg.getId(),
            rid = msg.get('inReplyTo'),
            m = id ? this.down(this.getMessageQuery(id)) : null,
            mStat = msg.get('Status');
        if (!id) console.warn('This message has no OID, cannot be targeted!', msg);

        if (m){
            m.update(msg);
            return;
        }

        //m is what we want to add too. It's either the root container (this) or its the replied-to-entry.
        m = this;

        if (rid){
            m = this.down(this.getMessageQuery(rid));
            if(!m){
                //create place holder, reassign m the ref to place holder
                m = this.add({
                    xtype: this.entryType,
                    message: Ext.create('NextThought.model.MessageInfo'),
                    messageId: rid
                });
            }
        }

        if (mStat == 'st_SHADOWED') {
            //this is a shadowed message, make sure to add a class to it
            m.addCls('shadowed');
        }

        //we are going to add then scroll to
        var o = m.add({
                        xtype: this.entryType,
                        message: msg,
                        messageId: msg.getId()
                    });
    },

    scroll: function(entry) {
        var input = entry.nextSibling('chat-reply-to');

        entry = input? input : entry;

        if (entry.el)
            entry.el.scrollIntoView(this.el.first('.x-panel-body'));
    },

    addNews: function(msg) {
        var o = this.add({
            html: msg
        });

        o.el.scrollIntoView(this.el.first());
    }
});
