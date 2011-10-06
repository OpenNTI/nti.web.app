
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
        align: 'top'
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
    	    toolTip: label,
    		toggleGroup: 'modeSwitcher'
		});

        this.add(b);
    	return b;
    },

    afterRender: function(){
    	this.callParent(arguments);
    	if(this.items.length)
	    	this.setWidth(this.items.get(0).getWidth()*this.items.length);
    }
});