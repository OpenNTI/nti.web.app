
Ext.define('NextThought.view.Viewport', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

    requires: [
        'NextThought.view.widgets.main.Header',
        'NextThought.view.modes.Container'
    ],
	
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: 'border',
	id: 'viewport',
	
    initComponent: function(){
   		this.callParent(arguments);
	    this.addEvents('clear-search', 'navigate');
		this.add({xtype: 'master-header', region: 'north'});
        this._container = this.add({xtype: 'modeContainer', region: 'center', id: 'mode-ctr'});
        window.VIEWPORT = this;
	},

    getActive: function(){
        return this._container.getActive();
    }
});