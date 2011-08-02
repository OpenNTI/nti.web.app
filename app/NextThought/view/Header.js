
Ext.define('NextThought.view.Header', {
	extend: 'Ext.panel.Panel',
	
	cls: 'x-header-bar',
    items: [],
    border: false,
    frame: false,
    
    initComponent: function(){
   		this.callParent(arguments);
    	this.add(Ext.create('NextThought.view.TopControls', {id: 'saerchbar'} ));
    }
    
});