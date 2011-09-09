
Ext.define('NextThought.view.Viewport', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

    requires: [
        'NextThought.view.widgets.Header',
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
		this.add(Ext.create('NextThought.view.widgets.Header', { region: 'north'}));

        this._container = Ext.create('NextThought.view.modes.Container', { region: 'center', id: 'mode-ctr'});
		this.add(this._container);
	},

    getActive: function(){
        return this._container.getActive();
    }
});