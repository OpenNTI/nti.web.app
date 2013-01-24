Ext.define('NextThought.view.content.SimplePopoverWidget',{
    extend: 'Ext.container.Container',

    alias: 'widget.simple-popover-widget',
    cls: 'simple-popover-widget' ,

    renderTo: Ext.getBody(),
    width: 400,
    maxHeight: 200,

    layout: 'fit',

    initComponent: function(){
        this.callParent(arguments);
        this.add(
            {
                xtype: 'box',
                autoScroll: true,
                autoEl:{
                    cls: 'bubble',
                    cn: [
                        {cls: 'text', html: this.text}
                    ]
                }
        });
    },


    afterRender: function(){
        var me = this;
        this.callParent(arguments);
        this.mon(this.el, {
            'mouseenter': function(){clearTimeout(me.closeTimer);},
            'mouseleave': me.startCloseTimer,
            scope: me
        });
    },


    startCloseTimer: function(){
        var me = this;
        me.closeTimer = setTimeout(function(){me.destroy();}, 1000);
    }
});
