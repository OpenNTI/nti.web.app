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
		this.store.on('load', this.reload, this);

		this.reload();
	},


	reload: function(){
		this.removeAll();

		var items = [],
			special = 'mycontacts-'+$AppConfig.username,
			hideMyContacts = this.hideMyContacts,
			check = this.checklist,
			name = this.username,
			communities = $AppConfig.userObject.getCommunities();

		if(this.actions){
			items.push.apply(items,this.actions);
		}

		//items.push({ cls: 'group-filter everyone', text: 'Everyone', isEveryone:true, record: UserRepository.getTheEveryoneEntity()});

		if(!this.hideCommunities && communities.length>0){
			Ext.each(communities,function(c){
				items.push({
					xtype: check ? 'menucheckitem': undefined,
					cls: 'group-filter',
					text: c.getName(),
					record: c,
					isGroup: true
				});
			});

			items.push({ xtype: 'labeledseparator', text: 'Groups', cls: 'doublespaced' });
		}

		this.store.each(function(v){
			if(v.get('Username')===special && hideMyContacts){
				return;
			}


			items.push({
				xtype: check ? 'menucheckitem': undefined,
				cls: 'group-filter',
				text: v.getName(),
				record: v,
				isGroup: true,
				checked: check && Ext.Array.contains(v.get('friends'),name)
			});
		});

		this.add(items);
	}
});
