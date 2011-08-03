

Ext.define( 'NextThought.view.modes.Container', {
	extend: 'Ext.panel.Panel',
	
	// plain: true,
	border: false, 
	frame: false,
	layout: {
		type: 'card',
		deferredRender: true
	},
	activeItem: 0,
	items:[],
	
	// constructor: function(){
	initComponent: function(){
    	this.callParent(arguments);
    	
		var m = this, 
			s = function(){ m.items.get(1).toggleButton.toggle(true); };
		
    	this.add(Ext.create('NextThought.view.modes.Home',   {id: 'a'} ));
    	this.add(Ext.create('NextThought.view.modes.Reader', {id: 'b'} ));
    	this.add(Ext.create('NextThought.view.modes.Stream', {id: 'c'} ));

    	setTimeout(s,100);
	}
});