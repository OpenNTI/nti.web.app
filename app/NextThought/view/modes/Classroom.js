

Ext.define( 'NextThought.view.modes.Classroom', {
	extend: 'NextThought.view.modes.Mode',
	alias: 	'widget.classroom-mode-container',
	requires: [],
	
    initComponent: function(){
    	var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;'}};
    	
   		this.callParent(arguments);
   		
   		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
   		this.add({ region: 'west', id: 'west-class', xtype: 'leftColumn', columnWidget: {} });

		this.add({
			cls: 'x-focus-pane',
            region: 'center',
			width: CENTER_WIDTH,
	    	dockedItems: [{
					xtype: 'toolbar',
					cls: 'x-docked-noborder-top',
					items: ['Classroom','->',
						{
							text: '&nbsp;',
							xtype: 'button',
							focusable: false,
							disabled: true
						}
					]
				}]
	    	
	    	});

		this.add({ region: 'east', id:'east-class', xtype: 'rightColumn', columnWidget: {} });
   		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    }
    
});