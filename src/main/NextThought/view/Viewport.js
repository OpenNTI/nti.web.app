
Ext.define('NextThought.view.Viewport', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

    requires: [
        'Ext.layout.container.Border',
        'NextThought.view.widgets.main.Header',
        'NextThought.view.modes.Container'
    ],
	
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: 'border',
	id: 'viewport',

    items:[
        {xtype: 'master-header', region: 'north'},
        {xtype: 'modeContainer', region: 'center', id: 'mode-ctr'}
    ],

    constructor: function(){
        if(NextThought.phantomRender){
            this.hidden = true;
        }
        this.callParent(arguments);
    },
	
    initComponent: function(){
        window.VIEWPORT = this;
        this.addEvents('clear-search', 'navigate');
        this.callParent(arguments);
	},

    getActive: function(){
        if(!this._container) {
            this._container = this.down('modeContainer');
        }
        return this._container.getActive();
    }
});
