

Ext.define( 'NextThought.view.modes.Container', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.modeContainer',
	requires: [
        'Ext.layout.container.Card',
        'NextThought.view.modes.Home',
        'NextThought.view.modes.Reader',
        'NextThought.view.modes.Stream',
        'NextThought.view.modes.Groups',
        'NextThought.view.modes.Classroom'
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
    	
		var m = this;

    	this.add({id: 'home',   xtype: 'home-mode-container'});
    	this.add({id: 'reader', xtype: 'reader-mode-container'});
    	this.add({id: 'stream', xtype: 'stream-mode-container'});
    	this.add({id: 'groups', xtype: 'groups-mode-container'});
        this.add({id: 'classroom', xtype: 'classroom-mode-container'});

        this.on('afterrender', function(){ m.items.first().toggleButton.toggle(true); });
	},


    getActive: function() {
        return this.getLayout().getActiveItem();
    }
});
