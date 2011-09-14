

Ext.define( 'NextThought.view.modes.Mode', {
	extend: 'Ext.panel.Panel',
	requires: [
			'NextThought.view.widgets.main.LeftColumn',
			'NextThought.view.widgets.main.RightColumn'
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
    	try{
            if(!this.toggleButton.pressed){
                this.toggleButton.toggle(true);
            }
            ct.getLayout().setActiveItem(item);
            this.getMainComponent().relayout();
        }
        catch(e){
            console.log(e.message, e);
        }
    },

    getMainComponent: function(){
        throw 'Implement me';
    }
    
});