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
        this.renderData.text=this.text;
        this.callParent(arguments);
    },


    setPositionToPoint: function(xy){
        this.setPosition(xy[0], xy[1], false);
    }


});
