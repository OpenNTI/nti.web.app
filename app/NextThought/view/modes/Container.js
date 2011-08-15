

Ext.define( 'NextThought.view.modes.Container', {
	extend: 'Ext.panel.Panel',
	requires: [
			'NextThought.view.modes.Home',
			'NextThought.view.modes.Reader',
			'NextThought.view.modes.Stream',
			'NextThought.view.modes.Groups'
			],
	
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
		
    	this.add({id: 'home', xtype: 'home-mode-container'});
    	this.add({id: 'reader', xtype: 'reader-mode-container'});
    	this.add({id: 'stream', xtype: 'stream-mode-container'});
    	this.add({id: 'groups', xtype: 'groups-mode-container'});

    	setTimeout(s,100);
	}
});