Ext.define('NextThought.view.menus.Share',{
	extend: 'Ext.menu.Menu',

	requires: [
		'NextThought.view.sharing.Window'
	],

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
		var me = this;
		me.callParent(arguments);

		//set up custom save win:
		me.custom = Ext.widget('share-window', {closeAction: 'hide'});

		me.mon(me.custom.down('button[action=save]'), {
			scope: me,
			click: function(btn){
				btn.up('window').close();
				me.updateValue( me.custom.getValue() );
			}
		});

		me.mon(me.custom.down('button[action=cancel]'), 'click', me.revert, me);

		me.store = Ext.getStore('FriendsList');
		me.mon(me.store,{
			scope: me,
			'datachanged':me.reloadFromStore,
			'load':me.reloadFromStore
		});

		me.on('click',me.handleClick, me);

		me.reloadFromStore();
	},


	destroy: function(){
		this.custom.destroy();
		delete this.custom;
		return this.callParent(arguments);
	},

	resolveValue: function(value){
		var p = LocationProvider.getPreferences(),
			result = null;
		//If we are not given a value, pull it from the location's preferences...
		if (!Ext.isArray(value)){
			p = LocationProvider.getPreferences();
			//we may not have preferences.
			p = p ? p.sharing : null;
			//we may not have sharing preferences, guard from error.
			result = p ? p.sharedWith : null;
		}

		//if there are no results yet, fall back to the given value (it may be blank as well)
		result = result || value;

		//if we don't have anything, just return an empty list.
		if (!Ext.isArray(result)){return [];}



		//clone the result to make sure we don't mess anything up when modifiying the list.
		result = result.slice();

		Ext.each(result,function(r,i,a){
			if(ParseUtils.parseNtiid(r)){
				a[i] = UserRepository.getStore().findRecord('NTIID',r,0,false,true,true) || r; //HACK!!
				if(!Ext.isString(a[i])){
					a[i] = a[i].get('Username');
				}
			}
		});


		return result;
	},


	reloadFromStore: function(){
		this.reload();
	},


	reload: function(value){
		this.removeAll(true);

		var sharedWith = this.resolveValue(value),
			items = [],
			communities = $AppConfig.userObject.getCommunities(),
			customChecked = false,
			onlyMeChecked,
			everyone = UserRepository.getTheEveryoneEntity();

		this.custom.setValue(sharedWith);

		onlyMeChecked = sharedWith.length === 0;

//		items.push({
//			cls: 'share-with everyone',
//			text: 'Everyone',
//			allowUncheck:false,
//			isEveryone:true,
//			record: everyone,
//			checked: Ext.Array.contains(sharedWith, everyone.get('Username'))
//		});
//		Ext.Array.remove(sharedWith, everyone.get('Username'));

		items.push({
			cls: 'share-with only-me',
			text: 'Only Me',
			allowUncheck:false,
			isMe: true,
			isGroup: true,
			checked: onlyMeChecked
		});

		if(communities.length>0){
			items.push({ xtype: 'labeledseparator', text: 'Communities', cls: 'doublespaced' });
			Ext.each(communities,function(c){
				var id=c.get('Username'),
					chkd =  Ext.Array.contains(sharedWith, id);

				if (chkd){
					sharedWith = Ext.Array.remove(sharedWith, id);
				}
				items.push({
					cls: 'group-filter',
					text: c.getName(),
					record: c,
					isGroup: true,
					checked: chkd
				});
			});
		}

		items.push({ xtype: 'labeledseparator', text: 'Groups', cls: 'doublespaced' });
		this.store.each(function(v){
			var id=v.get('Username'),
				chkd =  Ext.Array.contains(sharedWith, id);

			if (chkd){
				sharedWith = Ext.Array.remove(sharedWith, id);
			}

			items.push({
				cls: 'share-with',
				text: v.getName(),
				record: v,
				isGroup: true,
				checked: chkd
			});
		});

		if (sharedWith.length) {
			Ext.each(items, function(i){
				delete i.checked;
			});
			customChecked = true;
		}

		items.push({xtype: 'menuseparator'});
		items.push({ cls: 'share-with custom', text: 'Custom', allowUncheck:false, isCustom:true, checked: customChecked });

		this.add(items);
	},


	handleClick: function(menu, item){
		if(!item){return;}

		var c = item.checked,
			everyone = this.query('[isEveryone]')[0],
			me = this.query('[isMe]')[0],
			custom = this.query('[isCustom]')[0];


		if(item.isEveryone){
			Ext.each(this.query('[isGroup]'),function(o){
				o.setChecked(false,true);
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
//			everyone.setChecked(false, true);
			me.setChecked(false, true);
			custom.setChecked(false, true);
		}

		if (item.isCustom){
			this.custom.show();
			this.hide();
		}
		else {
			this.custom.setValue(this.getValue());
		}


		this.updateValue(this.getValue());
	},


	updateValue: function( value ){
		this.reload(value);
		this.previousValue = value;
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
		var m = this.query('[isMe]')[0],
			c = this.query('[isCustom]')[0],
			result = [];

		if (m.checked){
			return [];
		}
		else if (c.checked) {
			return this.custom.getValue();
		}


		Ext.each(this.query('[checked]'), function(c){
			result.push(c.record.get('Username'));
		});
		return result;
	},

	revert: function(){
		this.updateValue(this.previousValue);
	}
});
