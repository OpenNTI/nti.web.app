

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
        this.addEvents('activate-mode');
    	this.callParent(arguments);
    	var id = this.id,
            modeSwitcher = Ext.ComponentQuery.query('modeswitcher')[0];

    	this.toggleButton = modeSwitcher.addMode(id+' mode label',id+'-mode-icon');
    	this.toggleButton.modeReference = this;
    },
    
    activate: function(){
    	var ct = this.ownerCt,
    		me = this,
    		item = 0;
    		
    	if(!ct){
            console.error('No container??');
    		return;
    	}

        ct.fireEvent('activate-mode', this.getId());
    	
    	ct.items.each(function(o,i){
    		if(o==me) {
                item = i;
                return false;
            }
    	},this);

    	try{
            if(!this.toggleButton.pressed){
                this.toggleButton.toggle(true);
            }
            ct.getLayout().setActiveItem(item);
            this.getMainComponent().relayout();
        }
        catch(e){
            console.error('Activating Mode: ', e.message, e.stack||e.stacktrace, e);
        }
    },

    relayout: function(){
    	this.ownerCt.doComponentLayout();
    	this.doComponentLayout();
    	this.doLayout();
    },

    getMainComponent: function(){
        //implement me in subclasses!
        return this;
    }
    
});
