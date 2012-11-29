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
    cls: 'share-menu',
	constrainTo: Ext.getBody(),

	defaults: {
		ui: 'nt-menuitem',
		plain: true
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
			customSelected = false,
			onlyMeSelected,
			everyone = UserRepository.getTheEveryoneEntity();

		this.custom.setValue(sharedWith);

		onlyMeSelected = sharedWith.length === 0;

//		items.push({
//			cls: 'share-with everyone',
//			text: 'Everyone',
//			allowUncheck:false,
//			isEveryone:true,
//			record: everyone,
//			selected: Ext.Array.contains(sharedWith, everyone.get('Username'))
//		});
//		Ext.Array.remove(sharedWith, everyone.get('Username'));

		items.push({
			cls: 'share-with only-me onlyme-menu-item',
			text: 'Only Me',
			allowUncheck:false,
			isMe: true,
			isGroup: true,
            selected: onlyMeSelected
		});

		if(communities.length>0){
			//items.push({ xtype: 'labeledseparator', text: 'Communities'});
			Ext.each(communities,function(c){
				var id=c.get('Username'),
					chkd =  Ext.Array.contains(sharedWith, id);

				if (chkd){
					sharedWith = Ext.Array.remove(sharedWith, id);
				}
				items.push({
					cls: 'share-with group-filter community-menu-item',
					text: c.getName(),
					record: c,
					isGroup: true,
					selected: chkd
				});
			});
		}

        //add the custom thing
        items.push({ cls: 'share-with custom custom-menu-item', text: 'Custom', allowUncheck:false, isCustom:true});

        //add any groups
        items.push({ xtype: 'labeledseparator', text: 'Contacts'});
		this.store.each(function(v){
			var id=v.get('Username'),
				chkd =  Ext.Array.contains(sharedWith, id);

			if (chkd){
				sharedWith = Ext.Array.remove(sharedWith, id);
			}

			items.push({
				cls: 'share-with contact-menu-item',
				text: v.getName(),
				record: v,
				isGroup: true,
                selected: chkd
			});
		});

        //if nothing left, set custom
        if (sharedWith.length) {
            Ext.each(items, function(i){
                if (i.isCustom){i.selected = true;}
                else {delete i.selected;}
            });
        }

		this.add(items);
	},


	handleClick: function(menu, item){
		if(!item){return;}

        //mark others as unselected, selection as selected
        Ext.each(this.items.items, function(i){
            delete i.selected;
        });
        item.selected = true;

		if (item.isCustom){
			this.custom.show();
			this.hide();
		}
		else {
			this.custom.setValue(this.getValue());
		}

		this.updateValue(this.getValue());
        menu.hide();
	},


	updateValue: function( value ){
		this.reload(value);
		this.previousValue = value;
		this.fireEvent('changed',this);
	},


	getLabel: function(){
		var result = [];

		Ext.each(this.query('[selected=true]'), function(c){
			result.push(c.text);
		});


		return result.join(', ');
	},


	getValue: function(){
		var m = this.query('[isMe]')[0],
			c = this.query('[isCustom]')[0],
			result = [];

		if (m.selected){
			return [];
		}
		else if (c.selected) {
			return this.custom.getValue();
		}


		Ext.each(this.query('[selected=true]'), function(c){
			result.push(c.record.get('Username'));
		});
		return result;
	},

	revert: function(){
		this.updateValue(this.previousValue);
	}
});
