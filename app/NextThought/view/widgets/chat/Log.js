Ext.define('NextThought.view.widgets.chat.Log', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-log-view',

    autoScroll: true,
    layout: 'anchor',
    border: false,
    defaults: {border: false, defaults: {border: false}},

    initComponent:function() {
        this.callParent(arguments);
    },

    addMessage: function(msg) {
        var o = this.add({
                html: msg.get('Body')
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