

Ext.define( 'NextThought.view.modes.Home', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.home-mode-container',
	requires: [
			'NextThought.view.content.Home'
			],
	
	initComponent: function(){
		this.callParent(arguments);

		var bb = {
			xtype: 'toolbar', cls: 'x-docked-noborder-top',
			items: {focusable: false, disabled:true,text:'&nbsp;'}
		};

		this.add({ flex:1, focusable: false, dockedItems: bb });
		this.add({
			xtype: 'home-content-panel',
//			cls: 'x-focus-pane',
			region: 'center',
			flex: 6,
			minWidth: CENTER_WIDTH/3,
			maxWidth: CENTER_WIDTH,
			dockedItems: bb
		});
		this.add({ flex:1, focusable: false, dockedItems: bb });
	}
	
});
