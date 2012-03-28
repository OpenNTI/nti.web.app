Ext.define( 'NextThought.view.modes.Stream', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.stream-mode-container',
	requires: ['NextThought.view.content.Stream'],
	
	initComponent: function(){
		var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}},
			sideWidth = Globals.MIN_SIDE_WIDTH;
		this.callParent(arguments);

		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
		// this.add({ region: 'west', id: 'west-stream', xtype: 'leftColumn' });
		this.add({
			id: 'west-stream',
			xtype: 'leftColumn',
			width: sideWidth,
			columnWidget: {xtype:'filter-control',width: sideWidth}
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
			id:'east-stream',
			xtype: 'rightColumn',
			width: sideWidth,
			columnWidget: {items: {xtype: 'people-list',width: sideWidth}}
		});
		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
	}
	
});
