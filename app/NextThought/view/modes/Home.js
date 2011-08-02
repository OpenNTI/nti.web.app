

Ext.define('NextThought.view.modes.Home', {
	extend: 'Ext.panel.Panel',
	
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	// layout: 'border',
	layout: { type:'hbox', align: 'stretch'},
	
    items: [],
	
    
    constructor: function(config){
    	this.initConfig(config);
    	this.self.superclass.constructor.apply(this,arguments);
    	return this;
    },
    
    initComponent: function(){
    	var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}};
    	
   		this.callParent(arguments);
   		
   		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
   		
   		this.add({
    		region: 'west', 
    		id: 'west-home', 
    		//split: true, 
    		collapsible:true, 
    		//flex: 1, 
    		// minWidth: MIN_SIDE_WIDTH,
    		width: MIN_SIDE_WIDTH,
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

		this.add(Ext.create('NextThought.view.content.Library',{
			id: 'myLibrary', 
			region: 'center', 
			// flex: 3, 
			// minWidth: CENTER_WIDTH,
			width: CENTER_WIDTH,
			librarySource: this.librarySource,
	    	dockedItems: [{
					xtype: 'toolbar',
					cls: 'x-docked-noborder-top',
					items: ['Library','->',
						{
							text: '&nbsp;',
							xtype: 'button',
							focusable: false,
							disabled: true
						}
					]
				}]
	    	
	    	})); 

		this.add({
    		region: 'east', 
    		id:'east-home', 
    		//split: true, 
    		collapsible:true, 
    		// flex: 1, 
    		// minWidth: MIN_SIDE_WIDTH, 
    		width: MIN_SIDE_WIDTH, 
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
   		
   		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    }
    
});