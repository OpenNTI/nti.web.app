
Ext.define('NextThought.view.widgets.main.ModeSwitcher', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.modeswitcher',

    cls: 'mode-switcher',
	frame: false,
	border: false,
	margin: 5,
	layout: {
		type: 'hbox',
		pack: 'start',
		align: 'middle',
		shrinkToFit: false
	},
	items: [],
	modeReference: null,
    
    initComponent: function(){
   		this.callParent(arguments);
    },

    addMode: function(label, cls){
    	var b = Ext.create('Ext.button.Button', {
            cls: 'mode-button ',
    		iconCls: cls,
    		title: label,
    		allowDepress: false,
    		enableToggle: true,
    		//border: false,
    		//margin: 0,
    	    //text: label,
    		toggleGroup: 'modeSwitcher'
		});

        this.add(b);
    	
    	return b;
    },

    render: function(){
    	this.callParent(arguments);
    	if(this.items.length)
	    	this.setWidth(this.items.get(0).getWidth()*this.items.length);
    }
});