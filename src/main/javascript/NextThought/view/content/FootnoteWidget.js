Ext.define('NextThought.view.content.FootnoteWidget',{
    extend: 'Ext.container.Container',

    alias: 'widget.footnote-widget',
    cls: 'footnote-widget' ,

    renderTo: Ext.getBody(),
    width: 400,
    maxHeight: 200,
    autoScroll: true,

    //height: 'auto',
    requires: [
    ],

    cls: 'footnote-widget',

    renderTpl: Ext.DomHelper.markup([
    {
        cls: 'bubble',
        cn: [
            {cls: 'text', html: '{text}'}
        ]
    }]),


    renderSelectors:{
        text:'.text'
    },


    initComponent: function(){
        var me = this;
        me.renderData.text=me.text;
        me.callParent(arguments);
    },


    afterRender: function(){
        var me = this;
        this.callParent(arguments);
        this.el.on('mouseenter', function(){clearTimeout(me.closeTimer);});
        this.el.on('mouseleave', function(){me.destroy();});
    },


    startCloseTimer: function(){
        var me = this;
        me.closeTimer = setTimeout(function(){me.destroy();}, 1000);
    }
});
