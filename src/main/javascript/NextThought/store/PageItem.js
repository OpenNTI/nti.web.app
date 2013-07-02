Ext.define('NextThought.store.PageItem',function(){

	//TODO: use event domains
	var coordinator = new Ext.util.Observable();

	return {
		extend: 'Ext.data.Store',
		requires: [
			'NextThought.proxy.reader.Json',
			'NextThought.util.UserDataThreader'
		],
		model: 'NextThought.model.GenericObject',

		autoLoad: false,
		pageSize: 20,

		/**
		 * @property
		 * @cfg {Boolean} Stores added to the location provider will automatically forward their events to who ever
		 * listens to the location provider.  Set this to true to prevent this automatic behavior.
		 */
		doesNotShareEventsImplicitly: false,

		groupField: 'Class',
		groupDir  : 'ASC',
		proxy: {
			url: 'tbd',
			type: 'rest',
			limitParam: 'batchSize',
			pageParam: undefined,
			startParam: 'batchStart',
			reader: {
				type: 'nti',
				root: 'Items',
				totalProperty: 'FilteredTotalItemCount'
			},
			headers: {
				'Accept': 'application/vnd.nextthought.collection+json'
			},
			model: 'NextThought.model.GenericObject'
		},


		statics: {
			make: function makeFactory(url,id,disablePaging){
				var ps = this.create({
					clearOnPageLoad: false,
					containerId: id
				});
				ps.proxy.url = url;
				if(disablePaging){
					ps.proxy.limitParam = undefined;
					ps.proxy.startParam = undefined;
					delete ps.pageSize;
				}
				return ps;
			},


			peek: function(){
				return coordinator;
			}
		},

		onProxyLoad: function(operation) {
            var resultSet = operation.getResultSet();
			delete this.batchLinks;
			if( resultSet && resultSet.links ){
				this.batchLinks = resultSet.links;
			}

			return this.callParent(arguments);
		},

		constructor: function(){
			this.callParent(arguments);

			this.mon(coordinator,{
				delay: 1,//move this handler to the next event pump
				scope: this,
				'removed-item': this.removeByIdsFromEvent,
				'added-item': this.addFromEvent
			});
		},

		//By default PageItems want things that match the container
		wantsItem: function(record){
			return this.containerId === record.get('ContainerId');
		},


		getBins: function(){
			var groups = this.getGroups(),
					bins = {},
					k,b = null,
					getters = NextThought.util.UserDataThreader.GETTERS;

			for(k in groups){
				if(groups.hasOwnProperty(k)) {
					b = groups[k].name;
					bins[b] = Ext.Array.sort(groups[k].children,Globals.SortModelsBy(k,getters[b]));
				}
			}

			return b ? bins : null;
		},


		getItems: function(otherBins){
			var bins = otherBins||this.getBins()|| {},
					tree = this.buildThreads(bins);

			return Ext.Object.getValues(tree).concat(bins.Highlight||[]).concat(bins.Redaction||[]);
		},


		buildThreads: function(bins){
			var bms = bins.Bookmark;

			//handle bookmarks here:
			if(bms){
				if (bms.length !== 1) {
					console.error('Oops, more than 1 bookmark on this page??', bms);
				}
				NextThought.model.events.Bus.fireEvent('bookmark-loaded',bms[0]);
				delete bins.Bookmark;
			}

			return NextThought.util.UserDataThreader.buildThreads(bins);
		},


		//TODO the docs say this can take an array instead of a single instance.  We don't handle
		//that here
		add: function(record) {
			this.suspendEvents(true);
			console.log('Adding record to store', record, this);
			//get added to the store:
			this.callParent(arguments);

			function adoptChild(parent, child){
				//found our parent:
				child.parent = parent;
				if (!parent.children){parent.children = [];}
				//Check if we are not already in the children array
				if(!Ext.Array.contains(parent.children, child)){ parent.children.push(child); }
				//fire events for anyone who cares:
				parent.fireEvent('child-added', child);
				child.fireEvent('parent-set', parent);
			}

			function checkStoreItem(ancestor){
				return function checkItem(storeItem){
					if (ancestor === storeItem.getId()) {
						adopted = true;
						adoptChild(storeItem, record);
						return false;
					}

					if(!Ext.isEmpty(storeItem.children)){
						Ext.each(storeItem.children, checkItem);
					}
					return true;
				};
			}

			//find my parent if it's there and add myself to it:
			var adopted,
				refs = (record.get('references') || []).slice();

			if(!Ext.isEmpty(refs)){
				while(!adopted && !Ext.isEmpty(refs) ){
					this.each(checkStoreItem(refs.pop()));
				}

				if(!adopted){
					console.warn('Unable to parent child', record);
				}
			}

		//	coordinator.fireEvent('added-item', [record]);

			this.resumeEvents();
		},


		resolveRange: function(range){
			var i = range.start,
				length = range.end+ 1,
				ret = [];

			for(i; i<length; i++){
				ret.push(this.getAt(i));
			}

			return ret;
		},


		remove: function(){
			var toActuallyRemove = [],
				idsToBoradcast = [],
				args = Array.prototype.slice.call(arguments),
				records = args[0];

			//Prior to ext4.2 remove all did its own thing.  But now it calls
			//remove passing a range (removeAt also calls this but requires a new second optional
			//arg of count which isn't used anywhere in our code). This means that now, in ext4.2,
			//calling removeAll (like when we navigate pages) triggers all our special placeholder
			//and coordinator logic.  This is bad and does some really terrible and unexplainable behaviour
			//so just call super. This makes sure we have the same behaviour as pre ext4.2.
			if (typeof records === 'object' && !records.isModel) {
				return this.callParent(arguments);
			}

			args[0] = toActuallyRemove;

			if(Ext.isEmpty(records)){
				console.warn('Remove called with no records', records);
				return;
			}

			if (!Ext.isIterable(records)) {

				if (typeof records === 'object' && !records.isModel) {
		           records = this.resolveRange(records);
		        }
				else {
					records = [records];
				}
			}

			Ext.each(records, function(record){
				if(Ext.isNumber(record)){
					record = this.getAt(record);
				}

				if(record.placeholder || !record.wouldBePlaceholderOnDelete()){
					Ext.Array.push(toActuallyRemove, record);
					Ext.Array.push(idsToBoradcast, record.getId());
				}
				else{
					record.convertToPlaceholder();
				}
			}, this);

			if(!Ext.isEmpty(toActuallyRemove)){
				this.callParent(args);
			}

			Ext.each(toActuallyRemove, function(record){
				if(record.parent){ record.parent.fireEvent('child-removed', record);}
				record.tearDownLinks();
				record.fireEvent('destroy',record);
			});

			//FWIW: we may want to suspend (and queue) this event.  When records(instances of Model) are "destroyed" they
			// call this method in a tight loop over all stores that the record was associated.
			coordinator.fireEvent('removed-item', idsToBoradcast);
		},

		addFromEvent: function(records){
			//don't fire more coordinator events
			coordinator.suspendEvents();

			var me = this;

			try{
				Ext.each(records, function(rec){
					var current,
						newRecord;

					if(!me.wantsItem(rec)){
						return;
					}

					current = me.getById(rec.getId());

					if(!current){
						//create a new one since the record we were given was already added somewhere
						newRecord = ParseUtils.parseItems([rec.raw])[0];
						if(newRecord){
							me.add(newRecord);
						}
					}
				});
			}
			catch(er){
				console.warn(Globals.getError(er));
			}

			coordinator.resumeEvents();
		},

		removeByIdsFromEvent: function(ids){
			coordinator.suspendEvents();
			var me = this;

			try{
				Ext.each(ids,function(id){
					var r = me.getById(id);
					if(r){
						me.remove(r);
					}
				});
			}
			catch(e){
				console.warn(Globals.getError(e));
			}

			coordinator.resumeEvents();
		}
	};
});
