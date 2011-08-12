

Ext.define( 'NextThought.view.modes.Stream', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.stream-mode-container',
	
    initComponent: function(){
    	var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}};
   		this.callParent(arguments);

		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
		// this.add({ region: 'west', id: 'west-stream', xtype: 'leftColumn' });
		this.add({ region: 'west', id: 'west-stream', xtype: 'leftColumn', columnWidget: {xtype:'filter-control'} });
   		
   		this.add({
    		region: 'center',
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
				items: ['Stream','->',{ text: '&nbsp;', focusable: false, disabled:true }]
			}
    	});
    	
    	this.add({ region: 'east', id:'east-stream', xtype: 'rightColumn' }); 
    	this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    }
    
});