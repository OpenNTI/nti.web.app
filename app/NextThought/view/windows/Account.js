Ext.define('NextThought.view.windows.Account', {
    extend: 'Ext.panel.Panel',
    alias : 'widget.account-window',

    width: 600,
    height: '100%',

    floating: true,
    frame: true,
    modal: true,
    layout: 'fit',

    items: [{
        xtype:'form',
        border: 0,
        bodyPadding: 5,
        autoScroll: true,

        fieldDefaults: {
            labelWidth: 55,
            anchor: '100%'
        },

        layout: 'anchor',
        defaults: {
            anchor: '100%',
            allowBlank: false
        },

        items: [

        ]
    }],

    initComponent: function(){
        this.callParent(arguments);
        this.addDocked({
            xtype: 'toolbar', dock: 'bottom', ui: 'footer',
            layout: { pack: 'center' },
            items: [
                { minWidth: 80, text: 'Save', actionName: 'save' },
                { minWidth: 80, text: 'Cancel', actionName: 'cancel' }
            ]
        });

        Ext.EventManager.onWindowResize(this.doResize,this);
    },

    destroy: function(){
        Ext.EventManager.removeResizeListener(this.doResize,this);
        this.callParent(arguments);
    },

    doResize: function(w, h){
        this.setHeight(h);
    }

});