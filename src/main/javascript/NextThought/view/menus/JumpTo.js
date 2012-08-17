Ext.define('NextThought.view.menus.JumpTo',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.jump-menu',
	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 200,

	defaults: {
		ui: 'jumpto-menuitem',
		plain: true
	},

	initComponent: function(){
		this.callParent(arguments);
		this.on('click',this.handleClick,this);
	},


	handleClick: function(menu,item){
		if(!item || !item.ntiid){
			return;
		}
		if (item.rememberLastLocation){
			LocationProvider.setLastLocationOrRoot(item.ntiid);
			return;
		}
		LocationProvider.setLocation(item.ntiid);
	}
});
