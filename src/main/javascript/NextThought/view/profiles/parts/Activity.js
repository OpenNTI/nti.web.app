Ext.define('NextThought.view.profiles.parts.Activity',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-activity',

	requires: [
		'NextThought.view.profiles.parts.ActivityItem',
		'NextThought.view.profiles.parts.HighlightContainer',
		'NextThought.view.profiles.parts.Joined'
	],

	defaultType: 'profile-activity-item',
	layout: 'auto',

	initComponent: function(){
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.store = this.getStore();
		this.mon(this.store,{
			scope: this,
			load: this.storeLoaded,
			beforeload: this.showLoadingBar
		});

		this.store.load({callback: this.loadCallback, scope: this});
	},

	getStore: function(){
		var id = 'profile-activity-'+this.username,
			s = Ext.getStore(id);

		if(!s){
			s = NextThought.store.PageItem.create({
				id: id,
				wantsItem: function(rec){
					return this.hasOwnProperty('profileStoreFor') && this.profileStoreFor === rec.get('Creator');
				}});
		}

		s.proxy.url = (s.proxy.url||'').replace(
				//The wrapping slashes are an attempt to limit the scope of the search&replace :/
				'/'+encodeURIComponent($AppConfig.username)+'/',
				'/'+encodeURIComponent(this.username)+'/');

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
			add: this.itemsAddedToStore,
			remove: function(){console.debug('Removed item(s)');},
			bulkremove:function(){console.debug('Bulk Removed item(s)');}
		});

		return s;
	},

	showLoadingBar: function(){
		console.log('Show loading bar');
		//TOOD how to get the height into css.  If we don't specify it here it gets an
		//inline styled height
		this.add({
			xtype: 'panel',
			cls: 'loading-bar',
			itemId: 'loadingbar',
			height: 40,
			frame: false, border: false, plain: true,
			listeners: {
				afterrender: {
					fn: function(cmp){
						cmp.el.mask('Loading...');
					},
					single: true
				}
			}});
	},

	clearLoadingBar: function(){
		var bar = this.down('#loadingbar');
		console.log('Clear loading bar');
		if(bar){
			bar.unmask();
			this.remove(bar);
		}
	},

	cmpsFromRecords: function(records){
		var cmps = [], lastHighlightContainer;

		function getDate(rec){
			var d = rec.get('CreatedTime')||new Date(0);
			return new Date(
					d.getFullYear(),
					d.getMonth(),
					d.getDate());
		}

		function newContainer(rec){
			lastHighlightContainer = {
				xtype: 'profile-activity-highlight-container',
				date: getDate(rec),
				items:[rec]
			};
			cmps.push(lastHighlightContainer);
		}

		Ext.Array.each(records || [], function(i){
			var c = (i.get('Class')||'default').toLowerCase(),
				n = 'profile-activity-'+c+'-item',
				alias = 'widget.'+ n;

			if(c === 'highlight'){
				//This may simplify to line-item-like activity items in the future
				if(lastHighlightContainer && lastHighlightContainer.date.getTime() === getDate(i).getTime()){
					lastHighlightContainer.items.push(i);
				}
				else {
					newContainer(i);
				}
				return;
			}

			if(Ext.isEmpty(Ext.ClassManager.getNameByAlias(alias),false)){
				console.error('Unsupported type: ', n,' record: ',i, ', skipping');
				return;
			}

			cmps.push({record: i,root:true, xtype: n});
		},this);

		return cmps;
	},

	loadCallback: function(records, operation, success){
		if(!success && operation.error && operation.error.status === 404){
			//If we don't have a joined-event child add one now
			if(!this.down('joined-event')){
				this.add({ xtype: 'joined-event', username: this.username });
			}
		}
	},

	storeLoaded: function(store, records, successful){

		if(!successful){
			this.clearLoadingBar();
			return;
		}

		console.log('loaded ', records.length, ' items ');

		//For now we only do top level stuff
		records = Ext.Array.filter(records, function(rec){
			return !rec.isTopLevel || rec.isTopLevel();
		});


		var add = this.cmpsFromRecords(records),
			s = this.store,
			done = s.currentPage === s.getPageFromRecordIndex(s.getTotalCount());

		if(done){
			add.push({ xtype: 'joined-event', username: this.username });
		}

		this.suspendLayouts();
		this.clearLoadingBar();

		this.add(add);
		this.resumeLayouts(true);

		console.log('Showing', this.items.length, ' objects ');
	},

	itemsAddedToStore: function(store, records, index){
		var cmps;
		console.log('Records added at index', index, records);

		//For now we only do top level stuff
		records = Ext.Array.filter(records, function(rec){
			return !rec.isTopLevel || rec.isTopLevel();
		});


		if(Ext.isEmpty(records)){
			return;
		}

		//Here is where we could loop over existing cmps and ask them if
		//they want to handle addition.  That is one way we could support
		//coalescing highlights as they are added live.=

		//We don't maintain a sorted store so assume things
		//coming in an add method are the most recent.  Therefore
		//we just sort them adn stick them at the top
		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime'));
		cmps = this.cmpsFromRecords(records);
		this.add(0, cmps);
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
			s.nextPage({callback: this.loadCallback, scope: this});
		}
	}

});
