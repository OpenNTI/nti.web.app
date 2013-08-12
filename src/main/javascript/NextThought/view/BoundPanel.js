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
		if(this.emptyCmp){
			this.add(this.emptyCmp);
		}
	},


	onParentStoreLoad: function(store, records){
		var total = 0;

		Ext.each(records, function(item){
			total += item.getFriendCount();
		});

		if(total === 0){
			this.showEmptyState();
		}
	},


	onBoundStoreLoad: function(store,records){
		var items, total = 0;

		this.removeAll(true);
		if(this.initialConfig.items){
			this.add(this.initialConfig.items);
		}

		items = store.snapshot ? store.snapshot.items : store.data.items;

		Ext.each(items, function(item){
			total += item.getFriendCount()
		});

		if(total === 0){
			this.showEmptyState();
		}else{
			this.onBoundStoreAdd(store,items);
		}
	},


	onBoundStoreAdd: function(store,records,index){
		var insertionPoint = this.defaultInsertPoint || index,
			toAdd = Ext.Array.clean(Ext.Array.map(records,this.getComponentConfigForRecord,this));

		/*if(toAdd.length===1){
			//Figure out at what point to insert
			debugger;
		}*/

		this.insert(insertionPoint,toAdd);
	},


	onBoundStoreRemove: function(store,record){
		console.debug('remove',arguments);

		var cmp;
		this.items.each(function(i){

			if(i.recordId === record.getId()){
				cmp = i;
			}

			return !cmp;
		});

		console.debug('should remove ',cmp);
		if(cmp){
			this.remove(cmp);
		}
	}
});
