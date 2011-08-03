

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
			ms = NextThought.modeSwitcher, 
			s = function(){ m.items.get(1).toggleButton.toggle(true); };
		
    	this.add(Ext.create('NextThought.view.modes.Home',   {id: 'a', toggleButton: ms.addMode('home-mode','home-mode') } ));
    	this.add(Ext.create('NextThought.view.modes.Reader', {id: 'b', toggleButton: ms.addMode('book-mode','book-mode') } ));
    	this.add(Ext.create('NextThought.view.modes.Stream', {id: 'c', toggleButton: ms.addMode('strm-mode','strm-mode') } ));

    	setTimeout(s,100);
	}
});