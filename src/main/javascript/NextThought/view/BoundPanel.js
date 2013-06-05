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


	onBoundStoreLoad: function(store,records){
		var items;

		this.removeAll(true);
		if(this.initialConfig.items){
			this.add(this.initialConfig.items);
		}

		items = store.snapshot ? store.snapshot.items : store.data.items;
		this.onBoundStoreAdd(store,items);
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
