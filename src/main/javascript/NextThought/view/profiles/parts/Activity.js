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
	},

	afterRender: function(){
		this.callParent(arguments);
		if(isMe(this.username)){
			this.store = this.getStore();
			this.mon(this.store,{
				scope: this,
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
			accept: 'application/vnd.nextthought.note,application/vnd.nextthought.highlight',
			sortOn: 'createdTime',
			sortOrder: 'descending'
		});

		if(!LocationProvider.hasStore(s.storeId)){
			s.doesNotClear = true;
			s.doesNotShareEventsImplicitly = true;
			s.profileStoreFor = this.username;
			LocationProvider.addStore(s.storeId,s);
		}

		this.mon(s,{
			scope: this,
			//TODO: make smarter
			add: function(){console.debug('Added item(s)');},
			remove: function(){console.debug('Removed item(s)');},
			bulkremove:function(){console.debug('Bulk Removed item(s)');}
		});

		return s;
	},


	storeLoaded: function(store, records, success){
		console.log('loaded ', records.length, ' items ');

		var add = [],
			s = this.store,
			recordCollection = new Ext.util.MixedCollection();

		recordCollection.addAll(records || []);

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

		this.add(add);

		console.log('Showing', this.items.length, ' objects ');
	},


	onScrolledToBottom: function(){
		this.prefetchNext();
	},

	prefetchNext: function(){
		var s = this.store, max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount());
		if(s.currentPage < max && !s.isLoading()){
			console.log('Fetching next page of data', s);
			s.clearOnPageLoad = false;
			s.nextPage();
		}
	}

});
