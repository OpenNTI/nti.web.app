

Ext.define('NextThought.ui.modes.Reader', {
	extend: 'Ext.panel.Panel',
	
    border: false, 
	frame: false,
	autoScroll: false,
	defaults:{ border: false, frame: false },
	layout: 'border',
	// layout: 'hbox',
    items: [],
	
    
    constructor: function(config){
    	this.initConfig(config);
    	this.self.superclass.constructor.apply(this,arguments);
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
   		
   		// this.add({ xtype:'tbspacer', flex:1 });
    	
    	this.add({
    		region: 'west', 
    		id: 'west-book', 
    		// flex: 1, 
    		width: MIN_SIDE_WIDTH,
    		split: true, 
    		collapsible:true, 
    		minWidth: MIN_SIDE_WIDTH,
    		items: Ext.create('NextThought.ui.FilterControl',{}),
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
   		
   		this.add({
    		region: 'center',
    		flex: 1, 
    		minWidth: CENTER_WIDTH,
    		
    		border: false,
			frame: false,
			defaults: {border: false, frame: false},
			
			
			activeItem: 0,
			layout: 'card',
    		
    		height: 800,
    		dockedItems: Ext.create('NextThought.ui.navigation.Breadcrumb', Ext.copyTo({id:'breadcrumb',dock:'top'}, this, 'librarySource')),
    		items: Ext.create('NextThought.ui.content.Reader', Ext.copyTo({id:'myReader'}, this, 'librarySource'))
    	}); 
    	
    	this.add({
    		region: 'east', 
    		id:'east-book',
    		frame: false,
			border: false,
			defaults: {frame: false, border: false}, 
    		split: true, 
    		collapsible:true, 
    		// flex: 1, 
    		// width: MIN_SIDE_WIDTH,
    		minWidth: MIN_SIDE_WIDTH,
        	dockedItems: [{
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['Community','->',
					{
						text: '&nbsp;',
						xtype: 'button'
					}
				]
			}],
			items: [
				{
					padding: 5,
		    		html: [
		    		'<img src="resources/faces/01.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/02.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/03.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/04.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/05.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/06.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/07.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/08.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/09.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/10.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/11.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		'<img src="resources/faces/12.jpg" style="margin: 0.1em" width=32 height=32 style="float: left">',
		    		
		    		
		    		'<h4 style="margin: 2em 0 0 0";>Related Items</h4>',
		    		'<hr size=1/>',
		    		'<p style="margin: 0.6em 0"><img valign=top src="resources/images/video.png" width=16 height=16> Video on quadradic formula</p>',
		    		'<p style="margin: 0.6em 0"><img valign=top src="resources/images/video.png" width=16 height=16> Video on division</p>',
		    		'<p style="margin: 0.6em 0"><img valign=top src="resources/images/generic.png" width=16 height=16> Pre-Calculas, by Art of Problem Solving</p>',
		    		
		    		'<h4 style="margin: 2em 0 0 0";>Stream</h4>',
		    		'<hr size=1/>',
		    		'<p style="margin: 0.6em 0"><img valign=top src="resources/images/conversation.png" width=16 height=16> Just now, John Doe made a comment on a thread in Chapter 2, section 1.</p>',
		    		'<p style="margin: 0.6em 0"><img valign=top src="resources/images/conversation.png" width=16 height=16> 2 minutes ago, Jonathan responded to John Doe\s comment. </p>',
		    		'<p style="margin: 0.6em 0"><img valign=top src="resources/images/conversation.png" width=16 height=16> 5 minutes ago, John Doe made a comment in Chapter 2, section 1.</p>',
		    		
		    		].join('')
		    	}
    	]
    	});
    	
    	// this.add({ xtype:'tbspacer', flex:1 });
    }
    
});