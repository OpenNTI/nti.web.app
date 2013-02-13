Ext.define('NextThought.view.profiles.parts.Activity',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-activity',

	requires: [
		'NextThought.view.profiles.parts.ActivityItem'
	],

	defaultType: 'profile-activity-item',
	layout: 'auto',

	initComponent: function(){
		this.callParent(arguments);

		if(isMe(this.username)){
			this.store = this.getStore();
			this.mon(this.store,{
				scope: this,
				single: true,
				load: this.storeLoaded
			});

			this.store.load();
		}
		else{
			console.warn("Only support activity for authenticated user right now.", this.username, $AppConfig.username);
		}
	},

	getStore: function(){
		var id = 'profile-activity-'+this.username,
			s = Ext.getStore(id) || NextThought.store.PageItem.create({id:id});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			filter: 'TopLevel,MeOnly',
			accept: 'application/vnd.nextthought.note,application/vnd.nextthought.highlight'
		});

		this.mon(s,{
			scope: this,
			//TODO: make smarter
			add: function(){console.debug('Added item(s)');this.storeLoaded();},
			remove: function(){console.debug('Removed item(s)');this.storeLoaded();},
			bulkremove:function(){console.debug('Bulk Removed item(s)');this.storeLoaded();}
		});

		return s;
	},


	storeLoaded: function(){
		if(!this.rendered){
			this.on('afterrender',this.storeLoaded,this,{single:true});
			return;
		}

		var add = [],
			s = this.store,
			recordCollection = new Ext.util.MixedCollection();

		if(!LocationProvider.hasStore(s.storeId)){
			s.doesNotClear = true;
			s.doesNotShareEventsImplicitly = true;
			s.profileStoreFor = this.username;
			LocationProvider.addStore(s.storeId,s);
		}

		recordCollection.addAll(this.store.getItems() || []);
		recordCollection.sort({
			property: 'CreatedTime',
			direction: 'DESC',
			transform: Ext.data.SortTypes.asDate,
			root: 'data'
		});

		recordCollection.each(function(i){
			var n = 'profile-activity-'+(i.get('Class')||'default').toLowerCase()+'-item',
				alias = 'widget.'+ n,
				xtype;

			if(Ext.isEmpty(Ext.ClassManager.getNameByAlias(alias),false)){
				console.error('Unsupported type: ', n,' record: ',i, ', using the default');
			}
			else { xtype = n; }

			add.push({record: i,root:true, xtype: xtype});
		},this);

		Ext.suspendLayouts();
		this.removeAll(true);
		this.add(add);
		Ext.resumeLayouts(true);
	}

});
