Ext.define('NextThought.view.account.coppa.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.coppa-window',

    requires: [
        'NextThought.view.account.coppa.Header',
        'NextThought.view.account.coppa.Main'
    ],

    cls: 'coppa-window',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    modal: true,
    closable: false,
    resizable: false,

    width: 480,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {xtype: 'coppa-header-view'},
        {xtype: 'coppa-main-view'}
    ],

    initComponent: function(){
        this.callParent(arguments);

        this.down('coppa-main-view').setSchema(this.schema);
    }
});
