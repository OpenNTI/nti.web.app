

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

		this.add({
			xtype: 'home-content-panel',
//			cls: 'x-focus-pane',
			region: 'center',
			flex: 6,
			minWidth: this.CENTER_MIN_WIDTH,
			maxWidth: this.CENTER_MIN_WIDTH*3,
			dockedItems: bb
		});
	}
	
});
