
Ext.define('NextThought.view.navigation.Switcher', {
	extend: 'Ext.panel.Panel',
	
	frame: false,
	border: false,
	margin: 5,
	layout: {
		type: 'hbox',
		pack: 'start',
		align: 'middle',
		shrinkToFit: false,
	},
	items: [],
    
    initComponent: function(){
   		this.callParent(arguments);
    },
    
    
    addMode: function(label, cls, handler){
    	var b = Ext.create('Ext.button.Button', { 
    		iconCls: cls, 
    		title: label,
    		allowDepress: false,
    		enableToggle: true, 
    		border: false,
    		margin: 0,
    		toggleGroup: 'headSwitcher', 
    		toggleHandler: handler? handler : Ext.bind(this.switchState, this) 
		});
    		
    	this.add(b);
    	
    	return b;
    },
    
    
    render: function(){
    	this.callParent(arguments);
    	if(this.items.length)
    	this.setWidth(this.items.get(0).getWidth()*this.items.length);
    },
    
    
    switchState: function(btn, state){
    	console.log('Unhandled:',arguments);
    }
    
    
    
});