Ext.define( 'NextThought.view.modes.Stream', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.stream-mode-container',
	requires: ['NextThought.view.content.Stream'],
	
	initComponent: function(){
		var sideWidth = Globals.MIN_SIDE_WIDTH;
		this.callParent(arguments);

		this.add({
			dockedItems: this.getLeftToolbar(),
			minWidth: sideWidth,
			flex: 2,
			layout: {
				type:'hbox',
				pack: 'end'
			},
			items: {xtype:'filter-control',width: sideWidth}
		});

		this.add({
			xtype: 'stream-panel',
			cls: 'x-focus-pane',
			region: 'center',
			flex: 6,
			minWidth: this.CENTER_MIN_WIDTH,
			
			border: false,
			frame: false,
			defaults: {border: false, frame: false},

			activeItem: 0,
			layout: 'card',

			dockedItems: {
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['Stream','->',{ text: '&nbsp;', focusable: false, disabled:true }]
			}
		});


		this.add({
			border: false,
			defaults: {border: false,defaults:{border: false}},
			dockedItems: this.getRightToolbar(),
			minWidth: sideWidth,
			flex: 2,
			items: {
				margin: 'auto auto 15px 5px',
				items: {xtype: 'people-list',width: sideWidth}
			}
		});
	}
	
});
