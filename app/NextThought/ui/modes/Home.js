

Ext.define('NextThought.ui.modes.Home', {
	extend: 'Ext.panel.Panel',
	
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: 'border',
    items: [],
	
    
    constructor: function(config){
    	this.modeButton = config.toggleButton;
    	
    	this.items.push(Ext.create('NextThought.ui.content.Library',{id: 'myLibrary', region: 'center', flex: 3, minWidth: CENTER_WIDTH, librarySource: config.librarySource,
    	
    	dockedItems: [{
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['Library','->',
					{
						text: '&nbsp;',
						xtype: 'button'
					}
				]
			}]
    	
    	})); 
    	
    	this.items.push({
    		region: 'west', 
    		id: 'west-home', 
    		split: true, 
    		collapsible:true, 
    		flex: 1, 
    		minWidth: MIN_SIDE_WIDTH,
    		dockedItems: [{
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['->',
					{
						text: '&pi;',
						xtype: 'button',
						handler: function(e,c){
							Ext.getCmp('object-explorer').show();
						}
					}
				]
			}]
    	});
    	
    	this.items.push({
    		region: 'east', 
    		id:'east-home', 
    		split: true, 
    		collapsible:true, 
    		flex: 1, 
    		minWidth: MIN_SIDE_WIDTH, 
        	dockedItems: [{
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['...','->',
					{
						text: '&nbsp;',
						xtype: 'button'
					}
				]
			}]
    	});
    	
    	
    	this.self.superclass.constructor.apply(this,arguments);
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
    }
    
});