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

		//FIXME we do this in some other locations.   We
		//should consider doing the check and noop inside of
		//LocationProvider.setLocation.  I'm not sure everything
		//would be kosher with that right now...
		if(LocationProvider.currentNTIID === item.ntiid){
			return;
		}

		if (item.rememberLastLocation){
			LocationProvider.setLastLocationOrRoot(item.ntiid);
			return;
		}
		LocationProvider.setLocation(item.ntiid);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this, {
			scope: this,
			'mouseleave':this.startHide,
			'mouseenter':this.stopHide
		});
	},


	startHide: function(){
		var me = this;
		me.stopHide();
		me.leaveTimer = setTimeout(function(){me.hide();}, 500);
	},


	stopHide: function(){ clearTimeout(this.leaveTimer); }
});
