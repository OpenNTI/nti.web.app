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

		var p = LocationProvider.getPreferences();
		p = p ? p.sharing : null;
		var sharedWith = p ? p.sharedWith : null;

		if (!Ext.isArray(sharedWith)){sharedWith = [];}

		var items = [];
		//items.push('Share With');
		items.push({ cls: 'share-with everyone', text: 'Everyone', allowUncheck:false, isEveryone:true });
		items.push({ cls: 'share-with only-me', text: 'Only Me', isMe: true, isGroup: true,
			checked: sharedWith.length === 0
		});

		this.store.each(function(v){
			var chkd =  Ext.Array.contains(sharedWith, v.get('Username'));

			if(/everyone/i.test(v.get('ID'))){
				items[0].record = v;
				items[0].checked = chkd;
				return;
			}

			items.push({
				cls: 'share-with',
				text: v.get('realname'),
				record: v,
				isGroup: true,
				checked: chkd
			});
		});

		var customChecked = true;
		Ext.each(items, function(i){
			if (i.checked){
				customChecked = false;
				return false;
			}
		});

		items.push({ cls: 'share-with custom', text: 'Custom', allowUncheck:false, isCustom:true, checked: customChecked });

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
	},


	getLabel: function(){
		var result = [];

		Ext.each(this.query('[checked]'), function(c){
			result.push(c.text);
		});

		return result.join(', ');
	},


	getValue: function(){
		var e = this.query('[isEveryone]')[0],
			m = this.query('[isMe]')[0],
			c = this.query('[isCustom]')[0];

		if (e.checked) {
			return [e.record.get('Username')];
		}
		else if (m.checked){
			return [];
		}
		else if (c.checked) {
			return []; //TODO - get val from win
		}

		var result = [];

		Ext.each(this.query('[checked]'), function(c){
			result.push(c.record.get('Username'));
		});
		return result;
	}
});
