Ext.define('NextThought.view.coppa.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.coppa-window',

    requires: [
        'NextThought.view.coppa.Header'
    ],

    cls: 'coppa-window',
    ui: 'coppa-window',
    minimizable: false,
    constrain: true,
    closable: true,
    resizable: false,

    width: 535,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [],

    constructor: function(){
        this.items = [
            {xtype: 'coppa-header-view'}
        ];

        return this.callParent(arguments);
    }
});
