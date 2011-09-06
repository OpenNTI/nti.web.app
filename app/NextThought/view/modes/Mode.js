

Ext.define( 'NextThought.view.modes.Mode', {
	extend: 'Ext.panel.Panel',
	requires: [
			'NextThought.view.widgets.LeftColumn',
			'NextThought.view.widgets.RightColumn'
			],

	autoScroll: false,
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: { type:'hbox', align: 'stretch'},
    cls: 'x-application-mode-pane',
    items: [],

    initComponent: function(){
    	this.callParent(arguments);
    	var id = this.id;
    	this.toggleButton = NextThought.modeSwitcher.addMode(id+' mode label',id+'-mode-icon')
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
    		if(o==me) {
                item = i;
                return false;
            }
    	});
    	
    	ct.getLayout().setActiveItem(item);
    },

    getMainComponent: function(){
        throw 'Implement me';
    }
    
});