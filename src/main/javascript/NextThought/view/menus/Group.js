Ext.define('NextThought.view.menus.Group',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.group-menu',
	requires: [
	],

	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menuitem',
		plain: true,
		listeners: {
			'click':function(item){
				item.ownerCt.fireEvent('selected',item.record, item);
			}
		}
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('FriendsList');
		this.store.on('datachanged', this.reload, this);
		this.reload();
	},


	reload: function(){
		this.removeAll(true);

		var items = [];
		items.push({ cls: 'group-filter everyone', text: 'Everyone', isEveryone:true, record: UserRepository.getTheEveryoneEntity()});

		items.push({xtype: 'menuseparator'});
		this.store.each(function(v){
			items.push({
				cls: 'group-filter',
				text: v.getName(),
				record: v,
				isGroup: true
			});
		});

		this.add(items);
	}
});
