

Ext.define( 'NextThought.view.modes.Stream', {
	extend: 'NextThought.view.modes.Mode',
	
    initComponent: function(){
    	var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}};
   		this.callParent(arguments);

		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });

		this.add({
    		region: 'west', 
    		id: 'west-stream', 
    		// flex: 1, 
    		// minWidth: MIN_SIDE_WIDTH,
    		width: MIN_SIDE_WIDTH,
    		
    		// split: true, 
    		collapsible:true, 
    		items: Ext.create('NextThought.view.FilterControl',{id:'stream-control'}),
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
    		// flex: 3, 
    		// minWidth: CENTER_WIDTH,
    		width: CENTER_WIDTH,
    		
    		border: false,
			frame: false,
			defaults: {border: false, frame: false},
			
			
			activeItem: 0,
			layout: 'card',
    		
    		height: 800,
    		dockedItems: {
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['Stream','->',{
						text: '&nbsp;',
						xtype: 'button'
					}]
			},
    		items: Ext.create('NextThought.view.views.ItemNavigator', {})
    	});
    	
    	
    	
    	
    	this.add({
    		region: 'east', 
    		id:'east-stream',
    		frame: false,
			border: false,
			defaults: {frame: false, border: false}, 
    		// split: true, 
    		collapsible:true, 
    		// flex: 1, 
    		// minWidth: MIN_SIDE_WIDTH,
    		width: MIN_SIDE_WIDTH,
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
		    		
		    		
		    		'<h4 style="margin: 2em 0 0 0";>Suggested People</h4>',
		    		'<hr size=1/>',
		    		'<p style="margin: 0.6em 0"><img src="resources/faces/10.jpg" style="margin: 0.1em" width=32 height=32 valign=top> Eric Anderson</p>',
		    		'<p style="margin: 0.6em 0"><img src="resources/faces/09.jpg" style="margin: 0.1em" width=32 height=32 valign=top> Jane Doe</p>',
		    		'<p style="margin: 0.6em 0"><img src="resources/faces/12.jpg" style="margin: 0.1em" width=32 height=32 valign=top> Bugs Bunny</p>',
		    		
		    		'<h4 style="margin: 2em 0 0 0";>Widget App Store</h4>',
		    		'<hr size=1/>',
		    		'<p style="margin: 0.6em 0">Add</p>',
		    		
		    		
		    		].join('')
		    	}
    	]
    	}); 
    	
    	
    	this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    }
    
});