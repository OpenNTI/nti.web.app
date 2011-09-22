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
        this.callParent(arguments);
        this.entryType = this.entryType || 'chat-log-entry';
    },

    addMessage: function(msg) {
        var o = this.add({
                xtype: this.entryType,
                message: msg
            });

        o.el.scrollIntoView(this.el.first());
    },

    addNews: function(msg) {
        var o = this.add({
            html: msg
        });

        o.el.scrollIntoView(this.el.first());
    }
});