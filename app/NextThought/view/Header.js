
Ext.define('NextThought.view.Header', {
	extend: 'Ext.panel.Panel',
	
	cls: 'x-header-bar',
    items: [],
    border: false,
    frame: false,
    
    constructor: function(config){
    	this.items.push(Ext.create('NextThought.view.TopControls', {id: 'saerchbar'} ));
    	
    	this.self.superclass.constructor.apply(this,arguments);
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
    }
    
});