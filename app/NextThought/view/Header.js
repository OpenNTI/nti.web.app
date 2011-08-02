
Ext.define('NextThought.view.Header', {
	extend: 'Ext.panel.Panel',
	
	cls: 'x-header-bar',
    items: [],
    border: false,
    frame: false,
    
    constructor: function(config){
    	if(!config || !config.librarySource){
    		throw "no config, or no library source";
    	}
    	if(!config || !config.modeSwitch){
    		throw "no config, or no modeSwitch control";
    	}
    	
    	this.items.push(Ext.create('NextThought.view.TopControls', Ext.copyTo({id: 'saerchbar'}, config, 'modeSwitch,librarySource') ));
    	
    	this.self.superclass.constructor.apply(this,arguments);
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
    }
    
});