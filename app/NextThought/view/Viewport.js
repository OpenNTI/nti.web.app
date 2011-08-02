
Ext.define('NextThought.view.Viewport', {
	extend: 'Ext.container.Viewport',
	
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: 'border',
	
    initComponent: function(){
   		this.callParent(arguments);
	
		this.add(Ext.create('NextThought.view.Header', { region: 'north'}));
		this.add(Ext.create('NextThought.view.ModeContainer', { region: 'center', id: 'mode-ctr'}));
	}
});