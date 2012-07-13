Ext.define('NextThought.view.menus.Share',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.share-menu',

	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 150,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange':function(item, checked){ return checked || item.allowUncheck!==false; }
		}
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('FriendsList');
		this.store.on('load', this.reload, this);
		this.on('click',this.handleClick,this);
		this.reload();
	},

	reload: function(){
		this.removeAll(true);

		var items = [];
		//items.push('Share With');
		items.push({ cls: 'share-with everyone', text: 'Everyone', checked: true, allowUncheck:false, isEveryone:true });
		items.push({ cls: 'share-with only-me', text: 'Only Me', isMe: true, isGroup: true });


		this.store.each(function(v){
			if(/everyone/i.test(v.get('ID'))){
				return;
			}

			items.push({
				cls: 'share-with',
				text: v.get('realname'),
				record: v,
				isGroup: true
			});
		});

		items.push({ cls: 'share-with custom', text: 'Custom', allowUncheck:false, isCustom:true });

		this.add(items);
	},


	handleClick: function(menu, item, e){
		if(!item){return;}

		var c = item.checked,
			everyone = this.query('[isEveryone]')[0],
			me = this.query('[isMe]')[0],
			custom = this.query('[isCustom]')[0];

		if(item.isEveryone){
			Ext.each(this.query('[isGroup]'),function(o){
				o.setChecked(true,true);
			});
			custom.setChecked(false, true);
			me.setChecked(false, true);
		}
		else if(item.isMe || item.isCustom){
			Ext.each(this.query('menucheckitem'),function(o){
				o.setChecked(false,true);
			});
			item.setChecked(c, true);
		}
		else {
			everyone.setChecked(false, true);
			me.setChecked(false, true);
			custom.setChecked(false, true);
		}


		this.fireEvent('changed',this);
	}
});
