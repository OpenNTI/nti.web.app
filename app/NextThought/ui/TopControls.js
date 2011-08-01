
Ext.define('NextThought.ui.TopControls', {
	extend: 'Ext.panel.Panel',
	
	cls: 'x-brand-and-search-bar',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
	height: 60,
	layout: {
		type: 'hbox',
		align: 'middle'
	},
    items: [],
    
    constructor: function(config){
    	if(!config || !config.modeSwitch){
    		throw "no config, or no modeSwitch control";
    	}
    	this.initConfig(config);
    	this.self.superclass.constructor.apply(this,arguments);
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
   		
   		this.add({ 
   			html: '<img src="resources/images/ntbanner.png" alt="banner" width="180" height="60" />',
   			// border: true,
   			width: MIN_SIDE_WIDTH, 
   			height: 60
   			});
   		
   		// this.add({ xtype:'tbspacer', flex:1 });
   		
    	this.add({
    		// width: CENTER_WIDTH, 
    		flex: 1,
    		// border: true,
    		layout: 'hbox',
    		items: [
    			this.config.modeSwitch,
    			{ xtype: 'textfield', margin: 5, emptyText:'Search...'},
    		]
    	});
    	
    	// this.add({ xtype:'tbspacer', flex:1 });
    	
    	this.add({ width: MIN_SIDE_WIDTH, height: 25, 
    		// border: true, 
    		html: [
    		'<div style="float: right;  white-space: nowrap; margin-right: 5px">',
    			'<span style="padding: 5px; padding-top: 6px;font-size: 12px; vertical-align: middle">jsg2021</span> ',
    			' <span style="width: 24px; height: 23px; padding-top: 2px; display: inline-block; text-align: center; vertical-align: middle; background: url(\'resources/images/notify.png\') no-repeat -25px 0px;">0</span> ',
    			//' <img src="resources/faces/me.jpg" width=24 height=24 valign=middle> ',
    			' <img src="resources/images/gear.png" width=19 height=19 valign=middle>',
    		'</div>'
    		].join('') });
    }
});