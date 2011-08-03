

Ext.define( 'NextThought.view.modes.Mode', {
	extend: 'Ext.panel.Panel',

	autoScroll: false,
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: { type:'hbox', align: 'stretch'},
    items: [],

    initComponent: function(){
    	this.callParent(arguments);
    	this.toggleButton.modeReference = this;
    },
    
    activate: function(){
    	var ct = this.ownerCt,
    		me = this,
    		item = 0;
    		
    	if(!ct){
    		return;
    	}
    	
    	ct.items.each(function(o,i,l){
    		item = o==me? i : item;
    	});
    	
    	ct.getLayout().setActiveItem(item);
    }
    
});