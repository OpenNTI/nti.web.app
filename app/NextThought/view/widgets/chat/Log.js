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
        var j = Ext.JSON.decode(msg),
            o = this.add({
                html: 'time=' + new Date(j.Time*1000)
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