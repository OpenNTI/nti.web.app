Ext.define('NextThought.view.menus.Group',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.group-menu',
	requires: [
	],

	ui: 'nt',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 300,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menuitem',
		plain: true
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('FriendsList');
		this.store.on('load', this.reload, this);
		this.reload();
	},


 	reload: function(){
		this.removeAll(true);

		var items = [];
		items.push({ cls: 'group-filter everyone', text: 'Everyone', isEveryone:true });
		items.push({xtype: 'menuseparator'});
		this.store.each(function(v){
			if(/everyone/i.test(v.get('ID'))){
				return;
			}

			items.push({
				cls: 'group-filter',
				text: v.get('realname'),
				record: v,
				isGroup: true
			});
		});

		this.add(items);
	}
});
