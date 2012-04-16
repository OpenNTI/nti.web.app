Ext.define( 'NextThought.view.modes.Groups', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.groups-mode-container',
	requires: [
		'NextThought.view.widgets.GroupsView'
	],
	
	initComponent: function(){
		this.callParent(arguments);

		var sideWidth = Globals.MIN_SIDE_WIDTH;

		this.add({
			dockedItems: this.getLeftToolbar(),
			minWidth: sideWidth,
			flex: 2
		});

		this.add({
			cls: 'x-focus-pane',
			flex: 6,
			minWidth: this.CENTER_MIN_WIDTH,
			
			border: false,
			frame: false,
			defaults: {border: false, frame: false},
			
			height: 800,
			dockedItems: {
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['Groups:','-',
					{ text: 'Create', cls: 'create-button', createItem: true },
					{ text: 'Delete', cls: 'delete-button', disabled: true, deleteItem: true },
					'->',
					{ text: '&nbsp;', focusable: false, disabled:true }
				]
			},
			
			items: {xtype: 'groups-view'}
		});
		
		this.add({
			border: false,
			dockedItems: this.getRightToolbar(),
			minWidth: sideWidth,
			flex: 2
		});
	}
	
});
