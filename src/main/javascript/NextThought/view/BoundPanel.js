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

		return {record: rec};
	},


	onBoundStoreLoad: function(store,records){
		this.removeAll(true);
		this.onBoundStoreAdd(store,records);
	},


	onBoundStoreAdd: function(store,records){
		this.add(
			Ext.Array.clean(
				Ext.Array.map(records,this.getComponentConfigForRecord,this))
		);
	},


	onBoundStoreRemove: function(){
		console.debug('remove',arguments);
	}
});
