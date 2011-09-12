

Ext.define( 'NextThought.view.modes.Home', {
	extend: 'NextThought.view.modes.Mode',
	alias: 	'widget.home-mode-container',
	requires: [
			'NextThought.view.content.Library'
			],
	
    initComponent: function(){
    	var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;'}};
    	
   		this.callParent(arguments);
   		
   		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
   		this.add({ region: 'west', id: 'west-home', xtype: 'leftColumn', columnWidget: {} });

		this.add(Ext.create('NextThought.view.content.Library',{
			id: 'myLibrary',
            cls: 'x-focus-pane',
            region: 'center',
			//width: CENTER_WIDTH,
            flex: 6,
            minWidth: CENTER_WIDTH/3,
	    	dockedItems: [{
					xtype: 'toolbar',
					cls: 'x-docked-noborder-top',
					items: ['Library','->',
						{
							text: '&nbsp;',
							xtype: 'button',
							focusable: false,
							disabled: true
						}
					]
				}]
	    	
	    	})); 

		this.add({ region: 'east', id:'east-home', xtype: 'rightColumn', columnWidget: {} });
   		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    }
    
});