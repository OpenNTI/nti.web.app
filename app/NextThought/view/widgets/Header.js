
Ext.define('NextThought.view.widgets.Header', {
	extend: 'Ext.panel.Panel',
	
	cls: 'x-header-bar',
    items: [],
    border: false,
    frame: false,
    
    initComponent: function(){
   		this.callParent(arguments);
    	this.add(Ext.create('NextThought.view.widgets.TopControls', {id: 'top-controls'} ));
    }
    
});