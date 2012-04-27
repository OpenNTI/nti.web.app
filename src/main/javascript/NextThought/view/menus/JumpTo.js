Ext.define('NextThought.view.menus.JumpTo',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.jump-menu',
	ui: 'nt',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 300,

	defaults: {
		ui: 'jumpto-menuitem',
		plain: true
	},

	initComponent: function(){
		this.callParent(arguments);
		this.on('click',this.handleClick,this);
	}
});
