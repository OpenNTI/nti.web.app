Ext.define('NextThought.view.BoundPanel',{
	extend: 'Ext.container.Container',
	alias: 'widget.data-bound-panel',

	overflowX: 'hidden',
	overflowY: 'auto',

	initComponent: function(){
		this.callParent(arguments);
		this.store = this.store || Ext.getStore(this.storeId||'');
		if(!this.store){
			console.warn('No Store!');
			return;
		}

		this.mon(this.store,{
			scope: this,
			load: 'onBoundStoreLoad',
			'parent-store-loaded': 'onParentStoreLoad',
			add: 'onBoundStoreAdd',
			remove: 'onBoundStoreRemove'
		});
	},


	getComponentConfigForRecord: function(rec){
		if(rec.hidden || (this.filter && !this.filter(rec))){
			return null;
		}

		return {record: rec, recordId: rec.getId()};
	},


	showEmptyState: function(){
		if(this.emptyCmp && !this.emptyState){
			this.add(this.emptyCmp);
			this.emptyState = true;
		}
	},


	hideEmptyState: function(){
		if(this.emptyState && this.down('[emptyState=true]')){
			this.down('[emptyState=true]').destroy();
			this.emptyState = false;
		}
	},


	shouldHide: function(records){
		var allHidden = true, me = this;

		Ext.each(records, function(item){
			allHidden = allHidden && (!!item.hidden || (me.filter && !me.filter(item)));
		});

		return allHidden;
	},


	onParentStoreLoad: function(store, records){
		var total = 0;

		Ext.each(records, function(item){
			if(item.get('ID').indexOf('mycontacts') === 0){
				total += item.getFriendCount();
			}
		});

		if(total === 0){
			this.showEmptyState();
		}
	},


	onBoundStoreLoad: function(store){
		var items;

		this.removeAll(true);
		if(this.initialConfig.items){
			this.add(this.initialConfig.items);
		}

		items = store.snapshot ? store.snapshot.items : store.data.items;
		
		if(this.shouldHide(items) || Ext.isEmpty(items)){
			this.showEmptyState();
		}else{
			this.onBoundStoreAdd(store,items);
		}
	},


	onBoundStoreAdd: function(store,records,index){
		var insertionPoint = this.defaultInsertPoint || index,
			toAdd = Ext.Array.clean(Ext.Array.map(records,this.getComponentConfigForRecord,this));

		if(!this.shouldHide(records)){
			this.hideEmptyState();
		}

		this.insertItem(insertionPoint,toAdd);
	},


	onBoundStoreRemove: function(store,record){
		console.debug('remove',arguments);

		var me = this;
		function itr(i){
			if(i.recordId === record.getId()){
				me.removeItem(i,true);
				return false;
			}
			return true;
		}

		this.items.each(itr,this);

		if(this.shouldHide(store.getRange())){
			this.showEmptyState();
		}
	},


	removeAllItems: function(){
		this.removeAll(true);
	},


	insertItem: function(insertAt, toInsert){
		return this.insert(insertAt,toInsert);
	},


	removeItem: function(o,autoDestroy){
		return this.remove(o,autoDestroy);
	}
});
