

Ext.define( 'NextThought.view.modes.Groups', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.groups-mode-container',
	requires: [
		'NextThought.view.widgets.GroupsView'
	],
	
	initComponent: function(){
		this.callParent(arguments);

		var bb ={ xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}};

		this.add({ flex:1, focusable: false, dockedItems: bb });
		this.add({ region: 'west', id: 'west-groups', xtype: 'leftColumn', columnWidget: {} });
   		
   		this.add({
			cls: 'x-focus-pane',
			flex: 6,
			minWidth: CENTER_WIDTH/3,
			
			border: false,
			frame: false,
			defaults: {border: false, frame: false},
			
			height: 800,
			dockedItems: {
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['Groups:','-',
					{ text: 'Create', createItem: true },
					{ text: 'Delete', disabled: true, deleteItem: true },
					'->',
					{ text: '&nbsp;', focusable: false, disabled:true }
				]
			},
			
			items: {xtype: 'groups-view'}
		});
		
		this.add({ region: 'east', id:'east-groups', xtype: 'rightColumn', columnWidget: {} }); 
		this.add({ flex:1, focusable: false, dockedItems: bb });
	}
	
});
