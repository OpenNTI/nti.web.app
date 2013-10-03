Ext.define('NextThought.view.menus.Group', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.group-menu',
	requires: [
	],

	ui: 'nt',
	cls: 'custom-share-menu',
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
			'click': function(item) {
				item.ownerCt.fireEvent('selected', item.record, item);
			}
		}
	},

	listeners: {
		'mouseleave': function(menu) { menu.hide(); }
	},

	initComponent: function() {
		this.callParent(arguments);
		this.store = Ext.getStore('FriendsList');
		this.store.on('datachanged', this.reload, this);
		this.store.on('load', this.reload, this);

		this.reload();
	},


	reload: function() {
		this.removeAll();

		var items = [],
			special = 'mycontacts-' + $AppConfig.username,
			hideMyContacts = this.hideMyContacts,
			check = this.checklist,
			name = this.username,
			communities = $AppConfig.userObject.getCommunities(), lists = [], groups = [];

		if (this.actions) {
			items.push.apply(items, this.actions);
		}

		if (!this.hideCommunities && communities.length > 0) {
			Ext.each(communities, function(c) {
				items.push({
					xtype: check ? 'menucheckitem' : undefined,
					cls: 'share-with group-filter community-menu-item',
					text: c.getName(),
					record: c,
					isGroup: true
				});
			});
		}

		this.store.each(function(v) {
			if (v.get('Username') === special && hideMyContacts) {
				return;
			}

			var dfl = v.isDFL, target = dfl ? groups : lists;

			target.push({
				xtype: check ? 'menucheckitem' : undefined,
				cls: 'share-with ' + v.readableType + '-menu-item',
				text: v.getName(),
				record: v,
				isGroup: true,
				checked: check && Ext.Array.contains(v.get('friends'), name)
			});
		});

		items.push({ xtype: 'labeledseparator', text: 'Lists'});
		Ext.Array.push(items, lists);
		items.push({ xtype: 'labeledseparator', text: 'Groups'});
		Ext.Array.push(items, groups);

		this.add(items);
	}
});
