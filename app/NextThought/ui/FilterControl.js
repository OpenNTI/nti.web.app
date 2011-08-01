
Ext.define('NextThought.ui.FilterControl', {
	extend: 'Ext.panel.Panel',
	
	cls: 'x-filter-control-panel',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
    layout: 'hbox',
    padding: 5,
    
    constructor: function(config){
    	this.self.superclass.constructor.apply(this,arguments);
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
   		this.add({flex: 1});
   		this.add({
    			width: MIN_SIDE_WIDTH,
	    		html: [
	    		'<h4 style="margin: 2em 0 3em 0;">Welcome</h4>',
	    		'<h4 style="margin: 0.7em 0;">All</h4>',
	    		'<p style="margin: 0.7em 0;">&#10063; Group 1</p>',
	    		'<p style="margin: 0.7em 0;">&#10063; Group 2</p>',
	    		'<p style="margin: 0.7em 0;">&#10063; Group 3</p>',
	    		'<p style="margin: 0.7em 0;">&#10063; Group 4</p>',
	    		'<p style="margin: 0.7em 1.1em;">More</p>',
	    		'<p style="margin: 0.7em 0;">&#10063; Thought Stream</p>',
	    		'<p style="margin: 0.7em 0;">&#10063; Notifications</p>',
	    		
	    		'<hr size=1 style="margin: 2em 0; width: 50%"/>',
	    		
	    		'<h4 style="margin: 0.7em 0;">All</h4>',
	    		'<div style="margin: 0.7em 0;">&#10063; Highlights</div>',
	    		'<div style="margin: 0.7em 0;">&#10063; Notes</div>',
	    		'<div style="margin: 0.7em 0;">&#10063; Comments</div>',
	    		'<div style="margin: 0.7em 0;">&#10063; Videos</div>'
	    		
	    		].join('')
    	});
   	}
});